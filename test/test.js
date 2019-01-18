'use strict'

const Operator = require('../server/Operator')
const bigInt = require("big-integer")

const operator = '0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE'
let acc = new Operator()
//console.log(accumulator)

console.log('-------')

let tx0 = {checkpoint_i: 700, checkpoint_p: 5273, index: 3, inputs:[0,0], from:operator, to:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', amt:0.0001, sig:'0x1337', proof: '0x0' }
let tx1 = {checkpoint_i: 500, checkpoint_p: 3581, index: 2, inputs:[0,0], from:operator, to:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', amt:0.0001, sig:'0x1337', proof: '0x0' }
let tx2 = {checkpoint_i: 700, checkpoint_p: 2, index: 1, inputs:[0,0], from:operator, to:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', amt:0.0001, sig:'0x1337', proof: '0x0' }
let tx3 = {checkpoint_i: 700, checkpoint_p: 6991, index: 4, inputs:[0,0], from:operator, to:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', amt:0.0001, sig:'0x1337', proof: '0x0' }

let b0 = [tx0]
let b1 = [16369, 104849, 1300931, 7]
let b2 = [7, 5, 16369, 104849, 1300931, '32416187899', '32416188517', '32416188647', '32416189391', '32416189459', '32416189469']
let b3 = ['2997635304785533129', '2129620256793959569', '2432064126451395277', '514175537678074399', '514175537678074399', '514175537678074399', '514175537678074399']

let primes =  acc.addBlock(b0)
let A = acc.getAccumulators()

//acc.addBlock(b1)
A = acc.getAccumulators()


//acc.addBlock(b2)
//acc.addBlock(b3)
//console.log(acc.ids)

// acc.altInclusionWitnesses().forEach((e)=>{
//   console.log(e.toString())
// })

let pi = acc.generateInclusionProofs()
console.log('Proof of exponentiation: ' + JSON.stringify(pi[1]))
pi = acc.getSingleInclusionProof(353)
console.log('Single element proof: ' + JSON.stringify(pi))

//acc.altInclusionWitnesses()

console.log(acc.verifyPoKE(pi))

let v = bigInt(1)

primes[0].forEach((e)=>{
  //console.log(e)
  if(e!==undefined) v = v.multiply(e)
})

primes[1].forEach((e)=>{
  //console.log(e)
  if(e!==undefined) v = v.multiply(e)
})

acc.initPrimes().forEach((e)=>{
  console.log(e)
})

// v will be needed when a challenge to an exiting id is made
// show that some other prime not in the index range divides v
// show that v does not belong to the PoK proof provided
// todo: create function to get v
console.log(v.toString())