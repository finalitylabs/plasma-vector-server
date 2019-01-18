'use strict'

const bigInt = require("big-integer")
const utils = require('web3-utils')
const PoKE_H2P = require('./PoKE_H2P')
const Vector_H2P = require('./Vector_H2P')

const g = bigInt(3)
const N = bigInt('25195908475657893494027183240048398571429282126204032027777137836043662020707595556264018525880784406918290641249515082189298559149176184502808489120072844992687392807287776735971418347270261896375014971824691165077613379859095700097330459748808428401797429100642458691817195118746121515172654632282216869987549182422433637259085141865462043576798423387184774447920739934236584823824281198163815010674810451660377306056201619676256133844143603833904414952634432190114657544454178424020924616515723350778707749817125772467962926386356373289912154831438167899885040445364023527381951378636564391212010397122822120720357')

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

function _addElement(element, accumulator) {
  console.log('adding element: '+element+' to accumulator: '+accumulator.toString())
  return accumulator.modPow(element.toString(), N.toString())
}

function _deleteElement(v) {
  v = bigInt(v)
  console.log('deleting element: '+v+' from accumulator: '+this.A.toString())
  this.A_i = _getInclusionWitness(v).z
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
  // let h = g.modPow(v, N)
  // let B = bigInt(utils.hexToNumberString(utils.soliditySha3(g.toString(), A.toString(), h.toString())))
  // let z = proof.b.modPow(B, N)
  // let c = h.modPow(proof.r, N)

  // let c1 = z.multiply(c).mod(N)
  // let c2 = A.mod(N)
  // return c1.equals(c2)
}

// as per Xuanji's suggestion, let's keep x local to the operator, 
// generate an inclusion proof for a single given element
// uses NI-PoKE* proof of exponentiation so that recipients 
// of the proof don't need to witness the entire [g...A]
// currently only works for a prime included once
function _getInclusionWitness(v, ids){
  let z = g // g^x
  let x = bigInt(1) // cofactors
  let pi // {z, Q, r}

  for(var j=0; j<ids.length; j++){
    if(j!=v){
      x = x.multiply(ids[j])
      z = z.modPow(ids[j], N)
    }
  }

  // TODO: get PoE pi
  pi = [v, _getPoE(x, z, N)]
  return pi
}

function _getPoE(x, z) {
  let poke = new PoKE_H2P()
  let l = poke.hash(g, z)
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

function _convertIndex(i) {
  let start = i*256
  let end = (i+1)*256
  return [start, end]
}

// js Math.log return the ln(x) we must convert
// log_b(x) = ln(x) / ln(b)
function _logB(val, b) {
  console.log('log A = ' + Math.log(val) / Math.log(b))
  return Math.round(Math.log(val) / Math.log(b))
}

class RSAaccumulator {
  constructor() {
    this.A_i = g
    this.A_e = g
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
      this.A_i = _addElement(block[i] ,this.A_i, N)
      this.ids.push(block[i])
    }
    block.unshift(this.A_i.toString())
    this.blocks.push(block)
  }

  getAccumulators() {
    return [this.A_i, this.A_e]
  }

  getAccumulatorsByRange(e) {
    return bigInt(this.blocks[e][0])
  }

  _isContained(element, cofactor, _A) {
    element = bigInt(element)
    let res = g.modPow(element.multiply(cofactor).toString(), N.toString())
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

  getSingleInclusionProof(v) {
    return _getInclusionWitness(bigInt(v), this.ids, g, N)
  }

  // following notation from bunnz / boneh
  generateInclusionProofs(){
    let z = [] // g^x
    let x = [] // cofactors
    let pi = [] // {z, Q, r}
    for(var i=0; i<this.ids.length; i++){
      let _z = g
      let cof = bigInt(1)
      // todo: replace with call to _getInclusionWitness
      for(var j=0; j<this.ids.length; j++){
        if(j!=i){
          cof = cof.multiply(this.ids[j])
          _z = _z.modPow(this.ids[j], N)
        }
      }
      x.push(cof)
      z.push(_z)
      pi.push([this.ids[i],_getPoE(cof, _z, N)])
    }
    return pi
  }

  // altInclusionWitnesses(){
  //   let x = []
  //   let p = []
  //   for(var i=0; i<this.ids.length; i++){
  //     let _p = bigInt(3)
  //     _p = _p.modPow(this.ids[i], this.N)
  //     p.push(_p)
  //   }
  //   console.log('-----')
  //   for(var i=0; i<this.ids.length; i++){
  //     let wit = bigInt(1)
  //     let count = bigInt(1)
  //     let count2 = bigInt(0)
  //     for(var j=0; j<this.ids.length; j++){
  //       if(j!=i){
  //         wit = wit.multiply(p[j]).mod(this.N)
  //         count = count.multiply(this.ids[j])
  //         count2 = count2.plus(this.ids[j])
  //       }
  //     }
  //     count = count.minus(count2)
  //     let e = this.g.modPow(count, this.N)
  //     wit = wit.multiply(e).mod(this.N)
  //     x.push(wit)
  //   }
  //   return x
  // }

  // verifies the cofactor proof for a given range
  verifyPoKE(proof, v){
    let poke = new PoKE_H2P()
    let l = poke.hash(g, proof[1].z) // H_prime(u,w,z)
    let alpha = utils.soliditySha3 // sha(u, w, z, l)
    (
      { type: 'uint256', value: g.toString() },
      { type: 'bytes', value: utils.toHex(proof[1].z.toString()) },
      { type: 'uint256', value: l.toString() }
    )

    let a = bigInt(utils.hexToNumberString(alpha))
    // check: Q^l*u^r*g^alpha*r = w*z^alpha
    let left = proof[1].Q.modPow(l, N).multiply(g.modPow(proof[1].r, N).multiply(g.modPow(a.multiply(proof[1].r), N))).mod(N)
    let right = proof[1].z.multiply(proof[1].z.modPow(a, N)).mod(N)
    return left.equals(right)
  }

  // (bytes) TX { prevBlock, from, to, amt, sig }
  verifyTX(tx, previousTX, proofs) {
    let vector = new Vector_H2P()
    let previousBlock = this.blocks[tx.prevBlock]
    // todo abi pack tx to bytes?
    let i = _convertIndex(tx.index)
    let previousPrimes = vector.hash(i, previousTX)

    // todo check primes included and sig matches
  }

}

module.exports = RSAaccumulator