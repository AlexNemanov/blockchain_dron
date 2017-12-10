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

const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/zsnUDoEDGiylBGYqr1wp'));
const ownerAccount = '0x09f78D2417e0Cbef1EA50BF490E9971fdEf844Cc';
const dronAccount = '0xb8c92568028fd53c7f518c4b86945cff1f4ad3da';
const dronPrivKey = Buffer.from('3161b14bf26f820e22fb0bb30e5a3e714f8d3c605e2d274d47bf5f79645dd5e2', 'hex');
const tokenHolderAccount = '0x1597a82aa95fdd6f6a4df23df3c2de61d5220f39';
// 8c902aee0aae2a8e8635823a4bf7b53a820cb2fd49d6c9c470d48024bf03636c
const recipientAccount = '0x01ad7b8a65254637b7aedd649b8e8e3af7203707';
const recipientPrivKey = Buffer.from('52e8d4d6909f2c8f2e6aa109495d536f60366c4766e8d5a7b7633266749d9b2f', 'hex');

let n = 1;
let p = 20000000000;

web3.eth.getTransactionCount(ownerAccount, (err, nonce) => {
  n = nonce; 
  console.log(n);

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

  let sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  let test = async () => {
    // console.log(contractInstance.tokenHolders(dronAccount).then((e, r) => { console.log(e, r) }))
    contractInstance.addDron(dronAccount, { from: ownerAccount, gas: 2000000 }).then((e, r) => console.log(e, r));
    await sleep(2000);
    contractInstance.addTokenHolder(tokenHolderAccount, { from: ownerAccount, gas: 2000000 }).then((e, r) => console.log(e, r));
    await sleep(2000);
    const buf = new Buffer(16);
    uuid4(null, buf, 0);
    let orderId = `0x${buf.toString('hex')}`;
    console.log(orderId)
    // contractInstance.addOrder(orderId, recipientAccount, { from: tokenHolderAccount, gas: 2000000 });
    // await sleep(5000);
    // console.log(1)
  };
  test();
});