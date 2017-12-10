#!/usr/bin/env python
'''video recognition control'''

from pymavlink import mavutil
from MAVProxy.modules.lib import mp_module
import re
import cgi
import socket
import threading
import json
try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

sock = None
import sys
def exit_handler():
        if sock:
            sock.close()
        sys.exit(0)
import atexit
atexit.register(exit_handler)


state = 1

from sys import version as python_version

if python_version.startswith('3'):
    from http.server import BaseHTTPRequestHandler
else:
    from BaseHTTPServer import BaseHTTPRequestHandler

from BaseHTTPServer import BaseHTTPRequestHandler
from StringIO import StringIO

class HTTPRequest(BaseHTTPRequestHandler):
    def __init__(self, request_text):
        self.rfile = StringIO(request_text)
        self.raw_requestline = self.rfile.readline()
        self.error_code = self.error_message = None
        self.parse_request()

    def send_error(self, code, message):
        self.error_code = code
        self.error_message = message

class Httpd(object):
#Factor out common page serving logic to function
    def __init__(self):
        global sock
        self.serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock = self.serverSocket
        self.serverSocket.setblocking(0)
        self.port = 9000
        #Prepare a server socket
        self.serverSocket.bind(('', self.port))
        self.serverSocket.listen(1)

    def serve(self,conn_socket, msg):
        global state
        request = HTTPRequest(msg)

        if request.command == "POST":
            length = int(request.headers['content-length'])
            json = request.rfile.read(length)
            state = 2
        status_code = '200 OK'
        content = "test"
        headers = 'HTTP/1.1 %s\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: %d\r\n\r\n' % (status_code, len(content))
        #Send headers's 
        conn_socket.send(headers)
        for char in content:
            conn_socket.send(char)
        conn_socket.close()

    def get_connection(self,server_socket):
        conn_socket, addr = server_socket.accept()
        try:
            msg = conn_socket.recv(1024)
        except socket.error:
            return None
        if msg is None:
            return None
        return (conn_socket,msg)



class STModule(mp_module.MPModule):
    def __init__(self, mpstate):
        super(STModule, self).__init__(mpstate, "strt", "http start handling", public = True)
        global state
        self.rstate=1
        self.httpd = Httpd()
        #threading.Thread(target=self.httpd.serve_forever())

    def idle_task(self):
        global state
        #self.mpstate.input_queue.put('mode AUTO')
        try:
            args = self.httpd.get_connection(self.httpd.serverSocket)
        except socket.error:
            return
        #No request sent. Stop server from crashing upon recv() timeout
        if args is None:
            return
        #Spawn a new thread to handle request. New connection object will be created at next iteration.
        threading.Thread(target=self.httpd.serve, args=args).start()
        if state == 2 and self.rstate == 1:
            self.rstate == 2
            self.mpstate.input_queue.put('arm throttle')
            self.mpstate.input_queue.put('mode AUTO')
            self.mpstate.input_queue.put('takeoff 2')

def init(mpstate):
    '''initialise module'''
    return STModule(mpstate)
