'use strict'

const async = require('asyncawait/async')
const bigInt = require("big-integer")
const utils = require('web3-utils')
const PoKE_H2P = require('./PoKE_H2P')
const Vector_H2P = require('./Vector_H2P')
const Web3 = require('web3')
const MongoClient = require('mongodb').MongoClient
const dburl = 'mongodb://localhost/Operator_test'
const abi = require('./abi.js')
const operatorAddress = '0x8b9ffe438a877797385f1994270ec0d4e8cabc55'

const g = bigInt(3)
const N = bigInt('25195908475657893494027183240048398571429282126204032027777137836043662020707595556264018525880784406918290641249515082189298559149176184502808489120072844992687392807287776735971418347270261896375014971824691165077613379859095700097330459748808428401797429100642458691817195118746121515172654632282216869987549182422433637259085141865462043576798423387184774447920739934236584823824281198163815010674810451660377306056201619676256133844143603833904414952634432190114657544454178424020924616515723350778707749817125772467962926386356373289912154831438167899885040445364023527381951378636564391212010397122822120720357')
// hex_N C7970CEEDCC3B0754490201A7AA613CD73911081C790F5F1A8726F463550BB5B7FF0DB8E1EA1189EC72F93D1650011BD721AEEACC2ACDE32A04107F0648C2813A31F5B0B7765FF8B44B4B6FFC93384B646EB09C7CF5E8592D40EA33C80039F35B4F14A04B51F7BFD781BE4D1673164BA8EB991C2C4D730BBBE35F592BDEF524AF7E8DAEFD26C66FC02C479AF89D64D373F442709439DE66CEB955F3EA37D5159F6135809F85334B5CB1813ADDC80CD05609F10AC6A95AD65872C909525BDAD32BC729592642920F24C61DC5B3C3B7923E56B16A4D9D373D8721F24A3FC0F1B3131F55615172866BCCC30F95054C824E733A5EB6817F7BC16399D48C6361CC7E5

const prf = [[3,{"z":"21168615609548963274120773781125946682012924743949643382984609636343780752590852431623545243690559728087464167257451146142014511943475871736448123249722526934984475917391577120492668201664401366525647576294036469362881559767267701611480215479660774128160904844722787611295835231112750261101051071045210061242152733299793980775255736477601140492662069823350772945309114544265072340356805999830133792688493138409639368847997116923156515164618235411593625929738995723868293013192260383273069063508808354833353653224646350898220907028233534489955864114405968333900340387229482333250078037077203432447845856434495735253977","Q":"18602306971653750378993013602774775581519230247417920727404942815228020731410127135598440244213443369539308748995643110532939931912222489724588397025472257067836023312902844756849512629632184983785389490691650430913721723637254539967524622047463251467931958675858934227118829987399027852749930104964296962314749519529019379489229878193145221549948807161492561728923094289857158613477414221922303013118525180993180713312794736729202550467024687448110260466100718399167330156640870843786731619862924221587016312146457082942677919830358834931910812876908047316533989720199993422347596379100692770711591216063616141033378","r":"890119234231"}],[3,{"z":"21124061955735513758522613782734450215460238456121743493470419985971356071885930069824796088797777543784499964006357800982514002726935713043287406316739474437315598047832248873603649104473538521937937248482325458674828953049967442578818796143842210088201753550334718323320852138008818738685357228797787464309567667909420981617358727231915162322692205604254990228905100619862744310189176403461870546369586708301360896403214977122595392190311692783896417721493904941044534191622019979692726846059181591027535560817554185104149445354832433091900144215350785543353100905096542835733665609890706371965266319072367103327094","Q":"9643426135116943066897783156959404142491728153144504090898428366009502770715260101637270964572525708777864078102081648538342803064204908806224455917562665985860723335875563292872324685127598837503849009324542257853484335024718176519180023575867207947674445232363821763992614878955066032642005825311846874235057258593809536333263677350421928769682590190388137946707029683322438867569204402694451021645727652796621198593764505168171290256960668292239770575841752450121032366554349781776274450114785967038181371718513415004744609141828467635685224202895810281891492109424185759320404728818042305635240880405892692636489","r":"165318556017"}]]
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

const VLEN = 200000 // todo: 2^48


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
  // todo, get VLEN from input, get db.Checkpoints.count()
  // if(count*100 < VLEN)... start from vlen-count
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
  //console.log('adding element: '+element+' to accumulator: '+accumulator.toString())
  console.log('adding element: '+element)
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

  // verifies the cofactor proof for a given range
function _verifyPoKE(proof, v) {
  let Q = bigInt(proof[1].Q)
  let r = bigInt(proof[1].r)
  let z = bigInt(proof[1].z)
  let poke = new PoKE_H2P()
  let l = poke.hash(g, z) // H_prime(u,w,z) TODO, get w/z from v, not the incoming proof
  let alpha = utils.soliditySha3 // sha(u, w, z, l)
  (
    { type: 'uint256', value: g.toString() },
    { type: 'bytes', value: utils.toHex(z.toString()) },
    { type: 'uint256', value: l.toString() }
  )

  let a = bigInt(utils.hexToNumberString(alpha))
  // check: Q^l*u^r*g^alpha*r = w*z^alpha
  let left = Q.modPow(l, N).multiply(g.modPow(r, N).multiply(g.modPow(a.multiply(r), N))).mod(N)
  let right = z.multiply(z.modPow(a, N)).mod(N)
  return left.equals(right)
}


// int v: coin id
// [] idrange: coin id converted to vector range
// [] ids: all coin id (v) primes in [] ids_i. [] ids_e
// [] ids_t: all primes in A_i and A_e
async function _getInclusionWitness(v, id_range, ids, primes_i, primes_e, _x){
  //let id_map_i = {}
  //let id_map_e = {}
  let w_i = bigInt(1)
  let w_e = bigInt(1)
  let _x_i = bigInt(_x[0].i)
  let _x_e = bigInt(_x[0].e)

  for(var f=0; f<ids[0].length;f++){
    w_i = w_i.multiply(ids[0][f])
    //id_map_i[ids[0][f].toString()] = 1
  }
  for(var s=0; s<ids[1].length;s++){
    w_e = w_e.multiply(ids[1][s])
    //id_map_e[ids[1][s].toString()] = 1
  }

  w_i = _x_i.divide(w_i)
  w_e = _x_e.divide(w_e)

  let z_i = g.modPow(w_i, N) // g^x
  let z_e = g.modPow(w_e, N) // g^x
  //let x_ = bigInt(1) // cofactors
  let pi_i // {z, Q, r}

  // await primes_i.find().forEach((_p)=>{
  //   if(id_map_i[_p.Prime]!==1){
  //     x = x.multiply(_p.Prime) // todo store x and only do this for new primes, this should be dividing x by the product of v primes
  //     z = z.modPow(_p.Prime, N)
  //   }
  // })

  pi_i = [v, _getPoE(w_i, z_i, N)]

  // z = g
  // x = bigInt(1)
  let pi_e // {z, Q, r}

  // await primes_e.find().forEach((_p)=>{
  //   if(id_map_e[_p.Prime]!==1){
  //     x = x.multiply(_p.Prime)
  //     z = z.modPow(_p.Prime, N)
  //   }
  // })

  pi_e = [v, _getPoE(w_e, z_e, N)]
  // console.log(JSON.stringify(pi_e))
  // console.log(pi_i)
  return [pi_i, pi_e]
}


// x can get large
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

  console.log('modPow 1')
  let _Q = g.modPow(q, N)
  console.log('modPow  2')
  let _Q2 = _Q.modPow(a, N)
  console.log('multiply')
  let Q = _Q.multiply(_Q2).mod(N)
  console.log('done')
  //let Q = g.modPow(q, N).multiply(g.modPow(q.multiply(a), N)).mod(N)// (u^q)(g^alpha*q)
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
// for now verifyTX also removes previous tx from accumulator
function verifyTX(tx, previousBlock, checkpoints, primes_i, primes_e, x) {
  let vector = new Vector_H2P()
  let previousTX
  let checkpoint
  let A_i
  let A_e
  if(tx.inputs[0] !== null) {
    previousTX = previousBlock.txs[tx.inputs[1]]
    let i = _convertIndex(previousTX.index)
    checkpoint = _getCheckpoint(i[0], checkpoints)
    let previousPrimes = vector.hash(i, previousTX, checkpoint)
    // check previous primes are in A
    let prev_pi = previousTX.proof
    // and divide stored x by product of deleted primes
    // TODO get previous primes for value of tx.index
    if(_verifyPoKE(prev_pi[0], tx.index)!== true) {
      return false
    }
    if(_verifyPoKE(prev_pi[1], tx.index)!== true) {
      return false
    } 
    console.log(true)
    // delete previousPrimes product from x
    // delete p_i primes from x_i
    _deleteElement(previousTX.index, previousPrimes[0], primes_i, x)
    // delete p_e primes from x_e
    _deleteElement(previousTX.index, previousPrimes[0], primes_e, x)
    // A = g^new x value after deletion
    A_i = prev_pi[0].z
    A_e = prev_pi[1].z
    // get new primes
    // this only works for one coin per block
    i = _convertIndex(tx.index)
    tx.amt = tx.amt*10000
    checkpoint = _getCheckpoint(i[0], checkpoints)
    let newPrimes = vector.hash(i, tx, checkpoint)
    return [newPrimes]
  } else { // deposit tx
    // todo abi pack tx to bytes?
    let i = _convertIndex(tx.index)
    tx.amt = tx.amt*10000
    checkpoint = _getCheckpoint(i[0], checkpoints)
    previousTX = {index: 1, inputs:[0,0], from:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', to:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', amt:0.0001, sig:'0x1337'} // default deposit tx
    let newPrimes = vector.hash(i, tx, checkpoint)
    return [newPrimes]
  }
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

async function waitForConfirm(txHash, web3) {
  console.log('waiting for '+txHash+' to be confirmed...')
  let receipt = await web3.eth.getTransactionReceipt(txHash)

  if(receipt == null) {
    await timeout(1000)
    await waitForConfirm(txHash, web3)
  } else {
    return receipt
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function _handleDeposit(deposit){
  let depositer = deposit.returnValues.depositer
  let amt = deposit.returnValues.amount
  let offset = deposit.returnValues.offset

  // for now just submit a new block for every deposit
  let tx = {
    index: offset,
    inputs: [null,0],
    from: '0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE',
    to: depositer,
    amt: amt,
    sig: '0x1337',
    proof: prf
  }
  let b0 = {txs:[tx]}
  return b0
}

async function connectDB() {
  let client = await MongoClient.connect(dburl)
  let db = client.db('Operator_test')
  return db
}

class Operator {
  constructor() {
    this.web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/8987bc25c1b34ad7b0a6d370fc287ef9'))
    this.operator = new this.web3.eth.Contract(abi, operatorAddress)
    // mock memory database
    this.checkpoints = []
    this.accounts = {} // todo database
    this.deposits = {} //

  }

  async init() {
    this.db = await connectDB()
    this.checkpoints = _generatePrimeCheckpoints()
    let database = this.db.collection('Checkpoints')
    for(var i=0; i<this.checkpoints.length; i++) {
      let d = await database.find({index:this.checkpoints[i].index})
      let _d = await d.toArray()
      if(_d[0] === undefined) {
        await database.insertOne(this.checkpoints[i])
      }
    }

    let blockdb = this.db.collection('Blocks')
    let tb = await blockdb.find({BlockNumber:0})
    tb = await tb.toArray()
    if(tb[0] === undefined) await blockdb.insertOne({BlockNumber:0, A_i:3, A_e:3, txs:[]})

    let prime_product = this.db.collection('x')
    let x = await prime_product.find({ProductPointer:1})
    x = await x.toArray()
    if(x[0] === undefined) await prime_product.insertOne({ProductPointer:1, i: 1, e: 1})

    return this.checkpoints
  }

  async getAccountBalance(address) {
    let accountdb = this.db.collection('Accounts')
    let account = await accountdb.find({address: address})
    account = await account.toArray()
    return account
  }

  async addBlock(block) {
    console.log('adding list of txs to accumulator')
    let accountdb = this.db.collection('Accounts')
    let blocksdb = this.db.collection('Blocks')
    let depositsdb = this.db.collection('Deposits')
    let checkdb = this.db.collection('Checkpoints')
    let primes_i_db = this.db.collection('Primes_i')
    let primes_e_db = this.db.collection('Primes_e')
    let prime_product = this.db.collection('x')

    // primes
    let p_t

    let a_i
    let a_e

    let product = bigInt(1)

    for(var i=0; i<block.txs.length; i++){
      let _amt = block.txs[i].amt
      // accounting
      let newBal
      let t = await accountdb.find({address: block.txs[i].to})
      t = await t.toArray()
      let f = await accountdb.find({address: block.txs[i].from})
      f = await f.toArray()

      // create on function for deposit, one for transfer
      // account database generated from utxo set
      if(block.txs[i].inputs[0] === null) { // handle deposit
        let prevBlock = await blocksdb.find({BlockNumber:parseInt(block.BlockNumber)-1})
        prevBlock = await prevBlock.toArray()

        p_t = verifyTX(block.txs[i], prevBlock[0], this.checkpoints, primes_i_db, primes_e_db)

        if(t[0] === undefined) { // handle new account
          await accountdb.insertOne({address: block.txs[i].to, balance:_amt, coinIDs:[]})
        } else {
          newBal = parseInt(t[0].balance) + parseInt(_amt)
          await accountdb.updateOne({address: block.txs[i].to},{$set:{balance:newBal}})
        }

        a_i = bigInt(prevBlock[0].A_i)
        a_e = bigInt(prevBlock[0].A_e)
        //store deposit
        await depositsdb.insertOne({address: block.txs[i].to, finalized: true})
      } else { // handle transfer

        let parentBlock = await blocksdb.find({BlockNumber:parseInt(block.txs[i].index[0])})
        parentBlock = await prevBlock.toArray()

        p_t = verifyTX(block.txs[i], parentBlock[0], this.checkpoints, primes_i_db, primes_e_db)   

        newBal = parseFloat(t[0].balance) + parseFloat(block.txs[i].amt)
        newBal = newBal.toFixed(4)
        await accountdb.updateOne({address: block.txs[i].to}, {$set:{balance:newBal}})
        newBal = parseFloat(f[0].balance) - parseFloat(block.txs[i].amt)
        newBal = newBal.toFixed(4)
        await accountdb.updateOne({address: block.txs[i].from}, {$set:{balance:newBal}})

        //let incProof = await this.getSingleInclusionProof(block.tx[i].index, p_t[1])
        //a_i = incProof[0]
        //a_e = incProof[1]
      }
      // add new elements

      // move this in verify tx
      let x = await prime_product.find({ProductPointer:1})
      x = await x.toArray()
      let _x_i = bigInt(x[0].i)
      let _x_e = bigInt(x[0].e)

      for(var j=0; j<p_t[0][0].length; j++) {
        _x_i = _x_i.multiply(p_t[0][0][j])
        a_i = _addElement(p_t[0][0][j], a_i, N)
        await primes_i_db.insertOne({Prime:p_t[0][0][j].toString()})
      }
      for(var k=0; k<p_t[0][1].length; k++) {
        _x_e = _x_e.multiply(p_t[0][1][k])
        a_e = _addElement(p_t[0][1][k], a_e, N)
        await primes_e_db.insertOne({Prime:p_t[0][1][k].toString()})
      }

      await prime_product.updateOne({ProductPointer:1}, {$set:{i: _x_i.toString(), e: _x_e.toString()}})
    }

    block.A_i = a_i.toString()
    block.A_e = a_e.toString()
    // store block in db
    await blocksdb.insertOne(block)

    return p_t
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
  async getSingleInclusionProof(v, inputs) {
    let primes_i_db = this.db.collection('Primes_i')
    let primes_e_db = this.db.collection('Primes_e')
    let prime_product_db = this.db.collection('x')
    let _x = await prime_product_db.find({ProductPointer:1})
    _x = await _x.toArray()
    // generate primes from v client side as well for verification
    let vector = new Vector_H2P()
    let tx = inputs
    console.log('-------')
    console.log(tx)
    let id_range = _convertIndex(v)
    console.log(id_range)
    let checkpoint = _getCheckpoint(id_range[0], this.checkpoints)
    let ids = vector.hash(id_range, tx, checkpoint)


    let proof = await _getInclusionWitness(v, id_range, ids, primes_i_db, primes_e_db, _x)
    console.log('proof: ' + proof)
    return proof
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

  async checkDeposit(txhash) {
    let depositsdb = this.db.collection('Deposits')
    // let deposit = await depositsdb.find({Address:address})
    // deposit = await deposit.toArray()
    await waitForConfirm(txhash, this.web3)
    let receipt = await this.web3.eth.getTransactionReceipt(txhash)
    console.log(receipt.blockHash)

    let event = this.operator.events.Deposit({depositer:receipt.from},{fromBlock:0})

    this.operator.getPastEvents('Deposit',{
      fromBlock:0,
      toBlock: 'latest',
      filter: {depositer:receipt.from}
    }, async (e,l) => {
      for(var i=0; i<l.length; i++) {
        if(l[i].transactionHash === txhash) {
          let blocksdb = this.db.collection('Blocks')
          let oldBlock = await blocksdb.find().limit(1).sort({$natural:-1})
          oldBlock = await oldBlock.toArray()
          let b = _handleDeposit(l[i])
          let h = parseInt(oldBlock[0].BlockNumber)+1
          b['BlockNumber'] = h
          console.log(b)
          this.addBlock(b)
        }
      }
    })
  }
}

module.exports = Operator