'use strict'

const RSA = require('../server/accumulator')
const b = require("big-integer")

let RSA_2048 = '25195908475657893494027183240048398571429282126204032027777137836043662020707595556264018525880784406918290641249515082189298559149176184502808489120072844992687392807287776735971418347270261896375014971824691165077613379859095700097330459748808428401797429100642458691817195118746121515172654632282216869987549182422433637259085141865462043576798423387184774447920739934236584823824281198163815010674810451660377306056201619676256133844143603833904414952634432190114657544454178424020924616515723350778707749817125772467962926386356373289912154831438167899885040445364023527381951378636564391212010397122822120720357'

let acc = new RSA(3, RSA_2048)
//console.log(accumulator)

console.log('-------')

let b0 = [2, 3, 5]
let b1 = [16369, 104849, 1300931, 7]
let b2 = [7, 5, 16369, 104849, 1300931, '32416187899', '32416188517', '32416188647', '32416189391', '32416189459', '32416189469']
let b3 = ['2997635304785533129', '2129620256793959569', '2432064126451395277', '514175537678074399', '514175537678074399', '514175537678074399', '514175537678074399']

acc.addBlock(b0)
let A = acc.getAccumulator()
//console.log(acc.getInclusionWitnesses())

// console.log(acc._isContained(5, acc._getCofactor(5, 0, 0).toString(), A))
// console.log(acc._isContained(7, acc._getCofactor(7, 0, 0).toString(), A))

//let expProof = acc.getInclusionWitness(2,0,0)
//console.log(expProof)
//console.log(acc.verifyCofactor(expProof, 2))

acc.addBlock(b1)
A = acc.getAccumulator()
A = acc.getAccumulatorByRange(0)

//expProof = acc.getInclusionWitness(1300931,0,1)
//console.log(acc.verifyCofactor(expProof, 1300931))

// console.log(acc._isContained(7, acc._getCofactor(7, 0, 0).toString(), A))
// console.log(acc._isContained(5, acc._getCofactor(5, 0, 1).toString(), A))
// console.log(acc._isContained(1300931, acc._getCofactor(1300931, 0, 1).toString(), A))

//acc.addBlock(b2)
//acc.addBlock(b3)
console.log(acc.ids)
// acc.generateInclusionWitnesses().forEach((e)=>{
//   console.log(e.toString())
// })

// acc.altInclusionWitnesses().forEach((e)=>{
//   console.log(e.toString())
// })

acc.generateInclusionWitnesses()
// acc.initPrimes().forEach((e)=>{
//   console.log(e)
// })
//acc.altInclusionWitnesses()

// A = acc.getAccumulatorByRange(2)

// expProof = acc.getInclusionWitness('32416188647',0,2)
// console.log(acc.verifyCofactor(expProof, '32416188647'))
// console.log(expProof)

// console.log(acc._isContained(25, acc._getCofactor(25, 0, 2).toString(), A))
// console.log(acc._isContained('32416188647', acc._getCofactor('32416188647', 0, 2).toString(), A))