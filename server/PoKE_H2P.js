'use strict'

const bigInt = require("big-integer")
const utils = require('web3-utils')
const BN = require('bignumber.js')

class PoKE_H2P {
  hash(g, z) {
    let h
    let j = 0
    let bit64

    while(true) {
      if(z.toString().length <= 3) {
        h = utils.soliditySha3(
          { type: 'uint256', value: g },
          { type: 'uint256', value: z.toString() },
          { type: 'uint256', value: j },
        )
      } else {
        h = utils.soliditySha3(
          { type: 'uint256', value: g },
          { type: 'bytes', value: utils.toHex(new BN(z.toString())) },
          { type: 'uint256', value: j },
        )
      }

      h = h.slice(2,12) // todo: this probably doesn't match solidity uint64 cast from bytes
      bit64 = bigInt(utils.hexToNumberString(h))

      if(bit64.isPrime()) break
      j++
    }
    console.log('h2p preimage: '+ z.toString() + ' output: ' + bit64.toString())
    return bit64
  }
}

module.exports = PoKE_H2P