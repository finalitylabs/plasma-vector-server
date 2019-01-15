'use strict'

const bigInt = require("big-integer")
const utils = require('web3-utils')

class VectorClient {
  constructor(g, N, pk, sk) {
    this.g = bigInt(g) // CRS
    this.N = bigInt(N) // CRS
    this.A = this.g
    this.local_ids = []
    this.pk = pk
    this.sk = sk // todo decrypt with pass
  }

  sendCoins(coinIDs, destination) {

  }

  syncProofs() {
    // TODO call operator to get latest proofs for all owned coins
  }

  getAccumulator() {
    // call contract to get latest A
    return this.A
  }

  getInclusionWitness(coinIDs){
    // TODO: ping server
  }

  verifyProof(g, y, pi) {
    // check Q^l(ug^alpha)^r == wz^alpha
  }

}

module.exports = VectorClient