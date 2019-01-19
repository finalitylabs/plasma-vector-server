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

const VLEN = 1000 // todo: 2^48


// s = start check point index
// lastPrime = start check point prime
// i = index to get prime for
// e = end index for when to stop generating primes
// function _idToPrime(s, i, lastPrime, e) {
//   let primes = []
//   let t = i+e
//   for(var j=s; j<t; j++){
//     while(true) {
//       lastPrime = lastPrime.plus(1)
//       if(lastPrime.isPrime()) break
//     }
//     if(j==i) {
//       primes.push(lastPrime)
//       i++
//     }
//   }
//   return primes
// }

function _generatePrimeCheckpoints() {
  let checkpoints = []
  let primes = []
  let lastPrime = bigInt(3)
  checkpoints.push({index:1, prime:3})

  for(var j=2; j<VLEN; j++){
    while(true) {
      lastPrime = lastPrime.plus(2)
      if(lastPrime.isPrime()) break
    }
    if(j%100 === 0) {
      checkpoints.push({index:j, prime:lastPrime})
    }
  }

  return checkpoints
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

// int v: coin id
// [] idrange: coin id converted to range
// [] ids: all coin id primes in [] ids_i. [] ids_e
// [] ids_t: all primes in A_i and A_e
function _getInclusionWitness(v, id_range, ids, ids_t, g, N){
  let id_map_i = {}
  let id_map_e = {}

  let w_i = bigInt(1)
  let w_e = bigInt(1)
  for(var f=0; f<ids[0].length;f++){
    w_i = w_i.multiply(ids[0][f])
    id_map_i[ids[0][f].toString()] = 1
  }
  for(var s=0; s<ids[1].length;s++){
    w_e = w_e.multiply(ids[1][s])
    id_map_e[ids[1][s].toString()] = 1
  }

  let z = g // g^x
  let x = bigInt(1) // cofactors
  let pi_i // {z, Q, r}

  for(var j=0; j<ids_t[0].length; j++){
    if(id_map_i[ids_t[0][j].toString()]!==1){
      x = x.multiply(ids_t[0][j])
      z = z.modPow(ids_t[0][j], N)
    }
  }

  pi_i = [v, _getPoE(x, z, N)]

  z = g
  x = bigInt(1)
  let pi_e // {z, Q, r}

  for(var h=0; h<ids_t[1].length; h++){
    if(id_map_e[ids_t[1][h].toString()]!==1){
      x = x.multiply(ids_t[1][h])
      z = z.modPow(ids_t[1][h], N)
    }
  }

  pi_e = [v, _getPoE(x, z, N)]
  // console.log(JSON.stringify(pi_e))
  // console.log(pi_i)

  return [pi_i, pi_e]
}

function _getPoE(x, z) {
  let poke = new PoKE_H2P()
  let l = poke.hash(g, z)
  let alpha
  if(z.toString().length <= 3) {
    alpha = utils.soliditySha3 // sha(u, w, z, l)
    (
      { type: 'uint256', value: g.toString() },
      { type: 'uint256', value: z.toString() },
      { type: 'uint256', value: l.toString() }
    )
  } else {
    alpha = utils.soliditySha3 // sha(u, w, z, l)
    (
      { type: 'uint256', value: g.toString() },
      { type: 'bytes', value: utils.toHex(z.toString()) },
      { type: 'uint256', value: l.toString() }
    ) 
  }
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

function _getCheckpoint(index, checkpoints) {
  for(var i=0; i<checkpoints.length; i++){
    if(checkpoints[i].index > index) return checkpoints[i-1]
  }
}

  // (bytes) TX { prevBlock, from, to, amt, sig }
function verifyTX(tx, blocks, A_i, A_e, checkpoints) {
  let vector = new Vector_H2P()
  let previousBlock
  let previousTX
  let checkpoint
  if(tx.inputs[0] !== 0) {
    previousBlock = blocks[tx.inputs[0]]
    previousTX = previousBlock[tx.inputs[1]]
    let i = _convertIndex(tx.index)
    checkpoint = _getCheckpoint(d[0], checkpoints)
    let previousPrimes = vector.hash(i, previousTX, checkpoint)
  }
  // todo abi pack tx to bytes?
  let i = _convertIndex(tx.index)
  checkpoint = _getCheckpoint(i[0], checkpoints)
  previousTX = {index: 1, inputs:[0,0], from:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', to:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', amt:0.0001, sig:'0x1337'} // default deposit tx
  let newPrimes = vector.hash(i, tx, checkpoint)
  return newPrimes

  // todo check primes included and sig matches
  // todo delete verified tx previousPrimes from A
  // return [A`,newPrimes]
}

// js Math.log return the ln(x) we must convert
// log_b(x) = ln(x) / ln(b)
function _logB(val, b) {
  console.log('log A = ' + Math.log(val) / Math.log(b))
  return Math.round(Math.log(val) / Math.log(b))
}

class Operator {
  constructor() {
    this.A_i = g
    this.A_e = g
    this.blocks = []
    this.ids_i = [] // total list of all accumulated primes
    this.ids_e = [] 
    this.checkpoints = []
    this.accounts = {} // todo database
    this.block_height = 0
  }

  initPrimes() {
    this.checkpoints = _generatePrimeCheckpoints()
    return this.checkpoints
  }

  getAccountBalance(address) {
    let account = this.accounts[address]
    return account
  }

  depositListener() {

  }

  addBlock(block) {
    console.log('adding list of txs to accumulator')

    // todo verify txs
    // get primes
    let p_i = []
    let p_e = []
    let p

    let product = bigInt(1)

    for(var i=0; i<block.length; i++){
      // account database based on utxo set
      if(this.accounts[block[i].to] === undefined) {
        this.accounts[block[i].to]=block[i].amt
      } else {
        this.accounts[block[i].to]+=block[i].amt
      }
      this.accounts[block[i].from]=block[i].amt

      p = verifyTX(block[i], this.blocks, this.A_i, this.A_e, this.checkpoints)
      // add new elements
      let accumElems = bigInt(1)
      for(var j=0; j<p[0].length; j++) {
        this.A_i = _addElement(p[0][j], this.A_i, N)
        this.ids_i.push(p[0][j]) // todo adjust ids for 1 index 256 primes
      }
      for(var k=0; k<p[1].length; k++) {
        this.A_e = _addElement(p[1][k], this.A_e, N)
        this.ids_e.push(p[1][k])
      }
    }
    block.unshift(this.A_i.toString())
    this.blocks.push(block)
    this.block_height++

    return p
  }

  getAccumulators() {
    return [this.A_i, this.A_e]
  }

  getAccumulatorsByRange(e) {

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

  // int v: index of coin to get proof
  getSingleInclusionProof(v, inputs) {
    // generate primes from v client side as well for verification
    let vector = new Vector_H2P()
    let tx = this.blocks[inputs[0]][1+inputs[1]]
    console.log('-------')
    console.log(tx)
    let id_range = _convertIndex(v)
    let checkpoint = _getCheckpoint(id_range[0], this.checkpoints)
    let ids =  vector.hash(id_range, tx, checkpoint)
    return _getInclusionWitness(v, id_range, ids, [this.ids_i, this.ids_e], g, N)
  }

  // following notation from bunnz / boneh
  generateInclusionProofs(){
    // todo: adjust to multiple ids for 1 inclusion check
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

}

module.exports = Operator