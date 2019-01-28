'use strict'

const bigInt = require("big-integer")
const utils = require('web3-utils')
const BN = require('bignumber.js')

function hex2bin(hex){
  let hex1 = hex.slice(0,14)
  let hex2 = hex.slice(14,27)
  let hex3 = hex.slice(27,40)
  let hex4 = hex.slice(40,53)
  let hex5 = hex.slice(53,66)

  let bin1 = parseInt(hex1, 16).toString(2).padStart(8, '0')
  let bin2 = parseInt(hex2, 16).toString(2).padStart(8, '0')
  let bin3 = parseInt(hex3, 16).toString(2).padStart(8, '0')
  let bin4 = parseInt(hex4, 16).toString(2).padStart(8, '0')
  let bin5 = parseInt(hex5, 16).toString(2).padStart(8, '0')

  // todo debug this
  let bin = bin1+bin2+bin3+bin4+bin5+'0'

  return bin;
}

// s = start check point index
// lastPrime = start check point prime
// i = index to get prime for
// e = end index for when to stop generating primes
function getNextPrimes(s, i, lastPrime, e) {
  let primes = []
  let t = i+e
  for(var j=s; j<t; j++){
    while(true) {
      lastPrime = lastPrime.plus(1)
      if(lastPrime.isPrime()) break
    }
    if(j==i) {
      primes.push(lastPrime)
      i++
    }
  }
  return primes
}

class Vector_H2P {
  hash(index, input, checkpoint) {
    let h = utils.soliditySha3(
      { type: 'address', value: input.from },
      { type: 'address', value: input.to },
      { type: 'uint256', value: input.amt },
      { type: 'uint256', value: input.index[0]})

    let bin = hex2bin(h.slice(2,66))
    // getCheckpointIndex(input.index) // hardcoded at 700 for now

    let p_total = getNextPrimes(checkpoint.index, index[0], bigInt(checkpoint.prime.value), 256)

    let p_i = [] // corrisponding primes for vector postions with 1 in A_i
    let p_e = [] // corrisponding primes for vector postions with 0 in A_e

    for(var i=0; i<bin.length; i++){
      if(bin[i] === '1') {
        p_i.push(p_total[i])
      } else {
        p_e.push(p_total[i])
      }
    }

    return [p_i, p_e]
  }
}

module.exports = Vector_H2P