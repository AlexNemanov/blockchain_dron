/*
testrpc --db "path" \
  --account="0x517dc011ae232706747e197ee41c10ecba5a69041d5029027ea632d6f0eb002b,10000000000000000000" \
  --account="0x3161b14bf26f820e22fb0bb30e5a3e714f8d3c605e2d274d47bf5f79645dd5e2,22000000000000000000000" \
  --account="0x8c902aee0aae2a8e8635823a4bf7b53a820cb2fd49d6c9c470d48024bf03636c,22000000000000000000000" \
  --account="0x52e8d4d6909f2c8f2e6aa109495d536f60366c4766e8d5a7b7633266749d9b2f,22000000000000000000000" \
  --account="0x2bac593203f27f80660771d8f8c083fae2e4b26ef0b1edfe069333d5c316425f,22000000000000000000000" \
  --account="0xdc3eeec83d52782fdbfd2a00915d71f23884f88e080f9829804f34f1218c469e,22000000000000000000000" \
  --account="0x08adcafb55c152f5eb50e437c24c6c6c74f00d8ec4053b5356d766b0227f1665,0"
*/

const solc = require('solc');
const fs = require('fs');
const Web3 = require('web3');
const uuid4 = require('uuid/v4');
const sha3 = require('solidity-sha3');
const ethUtil = require('ethereumjs-util');
const express = require('express')

/*
const contractName = 'DronsContract';
let contractSource = fs.readFileSync(`./${contractName}.sol`, 'utf8');
let output = solc.compile(contractSource, 1);

fs.writeFileSync('abi', output.contracts[`:${contractName}`].interface);
fs.writeFileSync('bytecode', output.contracts[`:${contractName}`].bytecode);

// +++++++++++++++++++++++++++++++++++++

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const ownerAccount = web3.eth.accounts[0];
const dronAccount = web3.eth.accounts[1];
const dronPrivKey = Buffer.from('3161b14bf26f820e22fb0bb30e5a3e714f8d3c605e2d274d47bf5f79645dd5e2', 'hex');
const tokenHolderAccount = web3.eth.accounts[2];
const recipientAccount = web3.eth.accounts[3];
const recipientPrivKey = Buffer.from('52e8d4d6909f2c8f2e6aa109495d536f60366c4766e8d5a7b7633266749d9b2f', 'hex');

let abi = JSON.parse(fs.readFileSync('abi', 'utf8'));
let bytecode = fs.readFileSync('bytecode', 'utf8');
let contract = web3.eth.contract(abi);
let temp = contract.new({ data: bytecode, from: ownerAccount, gas: 1000000 });

let sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let tests = async () => {
  await sleep(1000);
  let contractAddress = temp.address;
  let contractInstance = contract.at(contractAddress);
  console.log(contractAddress);

  contractInstance.addDron(dronAccount, { from: ownerAccount, gas: 2000000 });
  contractInstance.addTokenHolder(tokenHolderAccount, { from: ownerAccount, gas: 2000000 });

  const buf = new Buffer(16);
  uuid4(null, buf, 0);
  let orderId = `0x${buf.toString('hex')}`;
  contractInstance.addOrder(orderId, recipientAccount, { from: tokenHolderAccount, gas: 2000000 });
  await sleep(1000); 

  let dronTookOff = new Date().getTime();
  const sig1 = ethUtil.ecsign(Buffer.from(sha3.default(dronTookOff).slice(2), 'hex'), dronPrivKey);
  
  let dronArrived = dronTookOff + 1000 * 60 * 10;
  const sig2 = ethUtil.ecsign(Buffer.from(sha3.default(dronArrived).slice(2), 'hex'), dronPrivKey);
  
  let recipientOrderArrive = dronArrived, recipientOrderStatus = 1;
  const sig3 = ethUtil.ecsign(Buffer.from(sha3.default(recipientOrderArrive, recipientOrderStatus).slice(2), 'hex'), recipientPrivKey);

  contractInstance.finishOrder(
    orderId, dronAccount,
    sig1.v | (sig2.v << 8) | (sig3.v << 16),
    `0x${sig1.r.toString('hex')}`, `0x${sig1.s.toString('hex')}`, dronTookOff,
    `0x${sig2.r.toString('hex')}`, `0x${sig2.s.toString('hex')}`, dronArrived,
    `0x${sig3.r.toString('hex')}`, `0x${sig3.s.toString('hex')}`, recipientOrderArrive, recipientOrderStatus,
    { from: ownerAccount, gas: 2000000 });

  await sleep(1000);  

  for (let id of contractInstance.getOrdersIds()) {
    console.log(contractInstance.getOrder(id.toFixed()));
  }

  // const filter = web3.eth.filter({
  //   fromBlock: 0,
  //   toBlock: 'latest',
  //   address: contractAddress,
  //   // topics: [web3.sha3('OrderFinished(bytes32,uint8,bytes32,bytes32,int,uint8,bytes32,bytes32,int,uint8,bytes32,bytes32,int,bool)')]
  // });
  
  // filter.watch((error, result) => {
  //    console.log(result)
  // });
}

tests().catch(e => console.error(e.message));
*/

// Express app
const app = express()
app.set('view engine', 'pug')

app.get('/order', (req, res) => {
  res.render('order', {
    title: 'Dronex', h1_text: 'Заказ'
  })
})

app.post('/order', (req, res) => {

// http.get('http://192.168.128.250', (resp) => {
// // http.get('http://golos.my/dron.php', (resp) => {
//     let data = '';
//
//     // A chunk of data has been recieved.
//     resp.on('data', (chunk) => {
//         data += chunk;
//     });
//
//     // The whole response has been received. Print out the result.
//     resp.on('end', () => {
//         console.log(JSON.parse(data));
//     });
//
//     }).on("error", (err) => {
//         console.log("Error: " + err.message);
//     }
// );
//

// // Set the headers
// var headers = {
//     'User-Agent':       'Super Agent/0.0.1',
//     'Content-Type':     'application/x-www-form-urlencoded'
// }
//
// // Configure the request
// var options = {
//     url: 'http://192.168.128.250',
//     method: 'GET',
//     headers: headers,
//     form: {"lat": 53.9000000, "long": 27.5666700, "type": "Beer"}
// }
//
// // Start the request
// request(options, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         // Print out the response body
//         console.log(body)
//     }
// })

})

app.listen(3000, () => console.log('Start on port 3000!'))

















