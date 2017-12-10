// 83da90c463bcb255020cf32f23d713fcef0b38e1d7a07800ed90c1f3df2969eb 0x09f78D2417e0Cbef1EA50BF490E9971fdEf844Cc
// https://kovan.infura.io/whJop5brX2pz8OOXHd9G 

const express = require('express');
const Web3 = require('web3');
const fs = require('fs');
const bodyParser = require('body-parser');
const dhttp = require('dhttp/200');
const uuid4 = require('uuid/v4');
const sha3 = require('solidity-sha3');
const ethUtil = require('ethereumjs-util');

const app = express();

// app.use(bodyParser.text({ type: 'text/plain' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/vendor', express.static('vendor'));
app.set('views', './views');
app.set('view engine', 'pug');

const ownerAccount = '0x09f78D2417e0Cbef1EA50BF490E9971fdEf844Cc';
const dronAccount = '0xb8c92568028fd53c7f518c4b86945cff1f4ad3da';
const dronPrivKey = Buffer.from('3161b14bf26f820e22fb0bb30e5a3e714f8d3c605e2d274d47bf5f79645dd5e2', 'hex');
const tokenHolderAccount = '0x1597a82aa95fdd6f6a4df23df3c2de61d5220f39';
const recipientAccount = '0x01ad7b8a65254637b7aedd649b8e8e3af7203707';
const recipientPrivKey = Buffer.from('52e8d4d6909f2c8f2e6aa109495d536f60366c4766e8d5a7b7633266749d9b2f', 'hex');

const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/zsnUDoEDGiylBGYqr1wp'));
const SignerProvider = require('ethjs-provider-signer');
const sign = require('ethjs-signer').sign;
const Eth = require('ethjs-query');
const provider = new SignerProvider('https://kovan.infura.io/zsnUDoEDGiylBGYqr1wp', {
  signTransaction: (rawTx, cb) => {
    rawTx.nonce = n;
    rawTx.gasPrice = p;
    ++n;
    cb(null, sign(rawTx, '0x83da90c463bcb255020cf32f23d713fcef0b38e1d7a07800ed90c1f3df2969eb'));
  },
  accounts: (cb) => {
    cb(null, [
      ownerAccount
    ]);
  }
});
const eth = new Eth(provider);

const EthContract = require('ethjs-contract');
const Contract = new EthContract(eth);

let abi = JSON.parse(fs.readFileSync('abi', 'utf8'));
let contract = Contract(abi);
let contractInstance = contract.at('0xc7051cc1e3CA3e5eDaD6999777305b9D0A3A6bA1');

let n = 1;
let p = 20000000000;

app.get('/', (req, res) => {
  res.render('confitm');
});

app.post('/finishOrder', (req, res) => {
  let orderId = req.body.order_id;
  
  console.log('order finished');
  let dronTookOff = new Date().getTime();
  let sig1 = ethUtil.ecsign(Buffer.from(sha3.default(orderId, dronTookOff).slice(2), 'hex'), dronPrivKey);
  
  let dronArrived = dronTookOff + 1000 * 60 * 10;
  let sig2 = ethUtil.ecsign(Buffer.from(sha3.default(orderId, dronArrived).slice(2), 'hex'), dronPrivKey);
  
  let recipientOrderArrive = req.body.recipientOrderArrive, recipientOrderStatus = req.body.result;
  let sig3 = { r: req.body.sgn_r, s: req.body.sgn_s, v: req.body.sgn_v };
  // let sig3 = ethUtil.ecsign(Buffer.from(sha3.default(orderId, recipientOrderArrive, recipientOrderStatus).slice(2), 'hex'), recipientPrivKey);

  web3.eth.getTransactionCount(ownerAccount, (err, nonce) => {
    n = nonce;
    contractInstance.finishOrder(
      orderId, dronAccount,
      sig1.v | (sig2.v << 8) | (sig3.v << 16),
      `0x${sig1.r.toString('hex')}`, `0x${sig1.s.toString('hex')}`, dronTookOff,
      `0x${sig2.r.toString('hex')}`, `0x${sig2.s.toString('hex')}`, dronArrived,
      `0x${sig3.r.toString('hex')}`, `0x${sig3.s.toString('hex')}`, recipientOrderArrive, recipientOrderStatus,
      { from: ownerAccount, gas: 2000000 }).then((e, r) => console.log(e, r));

    res.redirect('/');
  });
});

app.listen(4001);

let dronIP = 'http://localhost:4001/finishOrder';
let dronRunCmd = '{"lat": 53.9000000, "long": 27.5666700, "type": "Beer"}';

let ordersInProcessing = JSON.parse(fs.readFileSync('./ordersInProcessing.json', 'utf8'));

setInterval(() => {
  contractInstance.getOrdersIds((err, ordersIds) => {
    if (err) return;
    for (let p in ordersIds) {
      let id = ordersIds[p][0].toString(16);
      console.log(id)
      if (ordersInProcessing[id]) continue;
      contractInstance.getOrder(id).then((b) => {
        if (b['2'].toString(10) === '0') {
          console.log(b)
          dhttp({
            method: 'POST',
            url: dronIP,
            // body: { orderId: '0xe81ff3da56b448b297802091b155c824', recipientOrderArrive: 1, recipientOrderStatus: 1 },
            body: dronRunCmd,
            timeout: 2000      
          }, (err) => {
            if (err) {
              console.error(err.message);
            } else {
              ordersInProcessing[id] = true;
              fs.writeFileSync('./ordersInProcessing.json', JSON.stringify(ordersInProcessing));
            }
          });
        }
      });
    }
  });
}, 5000);