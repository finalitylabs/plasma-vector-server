'use strict'

const bigInt = require("big-integer")
const utils = require('web3-utils')
const PoKE_H2P = require('./PoKE_H2P')

// TODO NI-PoKE* proof of exponent knowledge scheme

// Vitalik proposal
// for generator g, element to be proven included/excluded v
// let x = cofactor of v
// let h = g^v, z = h^x
// B = hash(h,z) mod N
// b = h^floor(x/B)
// r = x mod B
//
// proof of exponent knowledge = (b, z)
// verification: 
// b^B * h^r = z
// z = h^B*floor(x/B)+x mod B = h^x

const VLEN = 100000 // todo: 2^48

function _idToPrime(id) {
  let prime
  // todo: select a proper function map the indicies of our vector to primes for the accumulator
  return prime
}

function _generatePrimeCheckpoints() {
  let checkpoints = []
  let primes = []
  let n = bigInt(1)
  for(var i=3; i<VLEN; i+=2) {
    let t = bigInt(i)
    if(t.isPrime()){
      // map index to prime t
      primes[n] = t
      if(n.mod(100).equals(0)){
        checkpoints.push({n,t})
      }
    }
    n = n.plus(1)
  }
  return checkpoints
}

function _hashFromCheckpoint(start, i, next){
  for(var z=start; z<next; z+=2) {
    let n = bigInt(start)
    let t = bigInt(z)
    if(t.isPrime()){
      if(n.equals(i)){
        return t
      }
    }
    n = n.plus(1)
  }
}

function _addElement(element, accumulator, N) {
  console.log('adding element: '+element+' to accumulator: '+accumulator.toString())
  return accumulator.modPow(element.toString(), N.toString())
}

function _deleteElement(v) {
  v = bigInt(v)
  console.log('deleting element: '+v+' from accumulator: '+this.A.toString())
  this.A = _getInclusionWitness(v).z
}

function _addElements(elements, accumulator) {
  console.log('adding list of txs to accumulator')
  let accumElems = bigInt(1)
  for(var i=0; i<elements.length; i++) {
    accumElems = accumElems.multiply(elements[i])
  }
  return accumulator.modPow(accumElems.toString(), N.toString())
}

function _isContained(element, accumulator, cofactor) {
  let res = g.modPow(element.multiply(cofactor).toString(), N.toString())
  return res.equals(accumulator.toString())
}

function _verifyCofactor(proof, v, A){
  let h = g.modPow(v, N)
  let B = bigInt(utils.hexToNumberString(utils.soliditySha3(g.toString(), A.toString(), h.toString())))
  let z = proof.b.modPow(B, N)
  let c = h.modPow(proof.r, N)

  let c1 = z.multiply(c).mod(N)
  let c2 = A.mod(N)
  return c1.equals(c2)
}

// as per Xuanji's suggestion, let's keep x local to the operator, 
// generate an inclusion proof for a single given element
// uses NI-PoKE* proof of exponentiation so that recipients 
// of the proof don't need to witness the entire [g...A]
// currently only works for a prime included once
function _getInclusionWitness(v){
  let z = this.g // g^x
  let x = bigInt(1) // cofactors
  let pi // {z, Q, r}

  for(var j=0; j<this.ids.length; j++){
    if(j!=v){
      x = x.multiply(this.ids[j])
      z = z.modPow(this.ids[j], this.N)
    }
  }

  // TODO: get PoE pi
  pi = _getPoE(x, z)
  return {pi, x, z}
}

function _getPoE(x, z, N) {
  let poke = new PoKE_H2P()
  let g = bigInt(3)
  let l = poke.hash(3, z)
  let alpha  = utils.soliditySha3 // sha(u, w, z, l)
  (
    { type: 'uint256', value: g.toString() },
    { type: 'bytes', value: utils.toHex(z.toString()) },
    { type: 'uint256', value: l.toString() }
  )
  let a = bigInt(utils.hexToNumberString(alpha))
  let q = x.divide(l)
  let r = x.mod(l) 
  let Q = g.modPow(q, N).multiply(g.modPow(q.multiply(a), N)).mod(N)// (u^q)(g^alpha*q)
  return {z,Q,r} // {z, Q, r}
}

// js Math.log return the ln(x) we must convert
// log_b(x) = ln(x) / ln(b)
function _logB(val, b) {
  console.log('log A = ' + Math.log(val) / Math.log(b))
  return Math.round(Math.log(val) / Math.log(b))
}

class RSAaccumulator {
  constructor(g, N) {
    this.g = bigInt(g)
    this.N = bigInt(N)
    this.A = this.g
    this.blocks = []
    this.ids = []
  }

  initPrimes() {
    return _generatePrimeCheckpoints()
  }

  addBlock(block) {
    console.log('adding list of txs to accumulator')
    let accumElems = bigInt(1)
    for(var i=0; i<block.length; i++) {
      this.A = _addElement(block[i] ,this.A, this.N)
      this.ids.push(block[i])
    }
    block.unshift(this.A.toString())
    this.blocks.push(block)
  }

  getAccumulator() {
    return this.A
  }

  getAccumulatorByRange(e) {
    return bigInt(this.blocks[e][0])
  }

  _isContained(element, cofactor, _A) {
    element = bigInt(element)
    let res = this.g.modPow(element.multiply(cofactor).toString(), this.N.toString())
    return res.equals(_A.toString())
  }

  _getCofactor(v, start, end) {
    let xv = bigInt(1)

    for(var i=start; i<=end; i++) {
      let l = this.blocks[i].length
      for(var j=1; j<l; j++) {
        xv = xv.multiply(this.blocks[i][j])
      }
    }
    return xv.divide(v)
  }

  getSingleInclusionWitness(v) {
    return _getInclusionWitness(v)
  }

  // following notation from bunnz / boneh
  generateInclusionWitnesses(){
    let z = [] // g^x
    let x = [] // cofactors
    let pi = [] // {z, Q, r}
    for(var i=0; i<this.ids.length; i++){
      let _z = this.g
      let cof = bigInt(1)
      // todo: replace with call to _getInclusionWitness
      for(var j=0; j<this.ids.length; j++){
        if(j!=i){
          cof = cof.multiply(this.ids[j])
          _z = _z.modPow(this.ids[j], this.N)
        }
      }
      x.push(cof)
      z.push(_z)
      // TODO: get PoE pi
      pi.push(_getPoE(cof, _z, this.N))
    }
    // console.log(x[0].toString())
    // console.log(this.g.modPow(x[0], this.N).toString())
    // console.log(w[0].toString())
    console.log(pi)
    return z
  }

  altInclusionWitnesses(){
    let x = []
    let p = []
    for(var i=0; i<this.ids.length; i++){
      let _p = bigInt(3)
      _p = _p.modPow(this.ids[i], this.N)
      //console.log(_p)
      p.push(_p)
    }
    console.log('-----')
    for(var i=0; i<this.ids.length; i++){
      let wit = bigInt(1)
      let count = bigInt(1)
      let count2 = bigInt(0)
      for(var j=0; j<this.ids.length; j++){
        if(j!=i){
          wit = wit.multiply(p[j]).mod(this.N)
          count = count.multiply(this.ids[j])
          count2 = count2.plus(this.ids[j])
          //console.log(count)
          //console.log(wit)
        }
      }
      count = count.minus(count2)
      let e = this.g.modPow(count, this.N)
      wit = wit.multiply(e).mod(this.N)
      x.push(wit)
    }

    return x
  }

  // [g^2, g^3, g^5]

  // verifies the cofactor proof for a given range
  verifyCofactor(proof, v){
    let h = this.g.modPow(v, this.N)
    let B = bigInt(utils.hexToNumberString(utils.soliditySha3(this.g.toString(), proof.A, h.toString())))

    let z = proof.b.modPow(B, this.N)
    let c = h.modPow(proof.r, this.N)

    let c1 = z.multiply(c).mod(this.N)
    let c2 = bigInt(proof.A).mod(this.N)
    return c1.equals(c2)
  }

}

module.exports = RSAaccumulator