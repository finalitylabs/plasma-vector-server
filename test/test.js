'use strict'

const RSA = require('../server/accumulator')
const b = require("big-integer")

let acc = new RSA()
//console.log(accumulator)

console.log('-------')

let b0 = [2, 3, 5]
let b1 = [16369, 104849, 1300931, 7]
let b2 = [7, 5, 16369, 104849, 1300931, '32416187899', '32416188517', '32416188647', '32416189391', '32416189459', '32416189469']
let b3 = ['2997635304785533129', '2129620256793959569', '2432064126451395277', '514175537678074399', '514175537678074399', '514175537678074399', '514175537678074399']

acc.addBlock(b0)
let A = acc.getAccumulators()
//console.log(acc.getInclusionWitnesses())

// console.log(acc._isContained(5, acc._getCofactor(5, 0, 0).toString(), A))
// console.log(acc._isContained(7, acc._getCofactor(7, 0, 0).toString(), A))

//let expProof = acc.getInclusionWitness(2,0,0)
//console.log(expProof)
//console.log(acc.verifyCofactor(expProof, 2))

acc.addBlock(b1)
A = acc.getAccumulators()
A = acc.getAccumulatorsByRange(0)

//expProof = acc.getInclusionWitness(1300931,0,1)
//console.log(acc.verifyCofactor(expProof, 1300931))

// console.log(acc._isContained(7, acc._getCofactor(7, 0, 0).toString(), A))
// console.log(acc._isContained(5, acc._getCofactor(5, 0, 1).toString(), A))
// console.log(acc._isContained(1300931, acc._getCofactor(1300931, 0, 1).toString(), A))

acc.addBlock(b2)
//acc.addBlock(b3)
console.log(acc.ids)
// acc.generateInclusionWitnesses().forEach((e)=>{
//   console.log(e.toString())
// })

// acc.altInclusionWitnesses().forEach((e)=>{
//   console.log(e.toString())
// })

let pi = acc.generateInclusionProofs()
console.log('Proof of exponentiation: ' + JSON.stringify(pi[1]))
pi = acc.getSingleInclusionProof(3)
console.log('Single element proof: ' + JSON.stringify(pi))
// acc.initPrimes().forEach((e)=>{
//   console.log(e)
// })
//acc.altInclusionWitnesses()

console.log(acc.verifyPoKE(pi))

let tx0 = {primecheck: 2, index: 500, from:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', to:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', amt:1, sig:'0x1337'}
let tx1 = {primecheck: 2, index: 500, from:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', to:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', amt:1, sig:'0x1337'}

acc.verifyTX(tx1, tx0, pi)