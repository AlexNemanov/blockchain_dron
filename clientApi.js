// browserify ./clientApi.js --standalone clientApi -o ./clientApi-b.js

const sha3 = require('solidity-sha3');
const ethUtil = require('ethereumjs-util');

module.exports = {
  sign: (orderId, recipientOrderArrive, recipientOrderStatus, recipientPrivKey) => {
    let sig3 = ethUtil.ecsign(Buffer.from(sha3.default(orderId, recipientOrderArrive, recipientOrderStatus).slice(2), 'hex'), Buffer.from(recipientPrivKey, 'hex'));
    return { r: sig3.r.toString('hex'), s: sig3.s.toString('hex'), v: sig3.v }
  }
};

console.log(module.exports.sign(1,1,1,'52e8d4d6909f2c8f2e6aa109495d536f60366c4766e8d5a7b7633266749d9b2f'))