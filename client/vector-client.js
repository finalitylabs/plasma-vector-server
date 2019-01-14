'use strict'

const bigInt = require("big-integer")
const utils = require('web3-utils')

// js Math.log return the ln(x) we must convert
// log_b(x) = ln(x) / ln(b)
function logB(val, b) {
  console.log('log A = ' + Math.log(val) / Math.log(b))
  return Math.round(Math.log(val) / Math.log(b))
}

class VectorClient {
  constructor(g, N) {
    this.g = bigInt(g) // CRS
    this.N = bigInt(N) // CRS
    this.A = this.g
    this.local_ids = []
  }

  sendCoins(coinIDs) {

  }

  syncProofs() {
    // TODO call operator to get latest proofs for all owned coins
  }
  getAccumulator() {
    // call contract to get latest A
    return this.A
  }

  getInclusionWitnesses(){
    // TODO: ping server
  }

}

module.exports = VectorClient