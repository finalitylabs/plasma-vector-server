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
const operatorAddress = '0xbe6d157643d2968077464b8602ff8447fdd9edb0'

const g = bigInt(3)
const N = bigInt('25195908475657893494027183240048398571429282126204032027777137836043662020707595556264018525880784406918290641249515082189298559149176184502808489120072844992687392807287776735971418347270261896375014971824691165077613379859095700097330459748808428401797429100642458691817195118746121515172654632282216869987549182422433637259085141865462043576798423387184774447920739934236584823824281198163815010674810451660377306056201619676256133844143603833904414952634432190114657544454178424020924616515723350778707749817125772467962926386356373289912154831438167899885040445364023527381951378636564391212010397122822120720357')
// hex_N C7970CEEDCC3B0754490201A7AA613CD73911081C790F5F1A8726F463550BB5B7FF0DB8E1EA1189EC72F93D1650011BD721AEEACC2ACDE32A04107F0648C2813A31F5B0B7765FF8B44B4B6FFC93384B646EB09C7CF5E8592D40EA33C80039F35B4F14A04B51F7BFD781BE4D1673164BA8EB991C2C4D730BBBE35F592BDEF524AF7E8DAEFD26C66FC02C479AF89D64D373F442709439DE66CEB955F3EA37D5159F6135809F85334B5CB1813ADDC80CD05609F10AC6A95AD65872C909525BDAD32BC729592642920F24C61DC5B3C3B7923E56B16A4D9D373D8721F24A3FC0F1B3131F55615172866BCCC30F95054C824E733A5EB6817F7BC16399D48C6361CC7E5

const prf = [[3,{"z":"21168615609548963274120773781125946682012924743949643382984609636343780752590852431623545243690559728087464167257451146142014511943475871736448123249722526934984475917391577120492668201664401366525647576294036469362881559767267701611480215479660774128160904844722787611295835231112750261101051071045210061242152733299793980775255736477601140492662069823350772945309114544265072340356805999830133792688493138409639368847997116923156515164618235411593625929738995723868293013192260383273069063508808354833353653224646350898220907028233534489955864114405968333900340387229482333250078037077203432447845856434495735253977","Q":"18602306971653750378993013602774775581519230247417920727404942815228020731410127135598440244213443369539308748995643110532939931912222489724588397025472257067836023312902844756849512629632184983785389490691650430913721723637254539967524622047463251467931958675858934227118829987399027852749930104964296962314749519529019379489229878193145221549948807161492561728923094289857158613477414221922303013118525180993180713312794736729202550467024687448110260466100718399167330156640870843786731619862924221587016312146457082942677919830358834931910812876908047316533989720199993422347596379100692770711591216063616141033378","r":"890119234231"}],[3,{"z":"21124061955735513758522613782734450215460238456121743493470419985971356071885930069824796088797777543784499964006357800982514002726935713043287406316739474437315598047832248873603649104473538521937937248482325458674828953049967442578818796143842210088201753550334718323320852138008818738685357228797787464309567667909420981617358727231915162322692205604254990228905100619862744310189176403461870546369586708301360896403214977122595392190311692783896417721493904941044534191622019979692726846059181591027535560817554185104149445354832433091900144215350785543353100905096542835733665609890706371965266319072367103327094","Q":"9643426135116943066897783156959404142491728153144504090898428366009502770715260101637270964572525708777864078102081648538342803064204908806224455917562665985860723335875563292872324685127598837503849009324542257853484335024718176519180023575867207947674445232363821763992614878955066032642005825311846874235057258593809536333263677350421928769682590190388137946707029683322438867569204402694451021645727652796621198593764505168171290256960668292239770575841752450121032366554349781776274450114785967038181371718513415004744609141828467635685224202895810281891492109424185759320404728818042305635240880405892692636489","r":"165318556017"}]]

const VLEN = 1000000 // todo: 2^48

async function _generatePrimeCheckpoints(checkdb) {
  // todo, get VLEN from input, get db.Checkpoints.count()
  // if(count*100 < VLEN)... start from vlen-count
  let checkpoints = await checkdb.find()
  checkpoints = await checkpoints.toArray()
  let primes = []
  let lastPrime

  if(checkpoints[0] === undefined) {
    checkpoints = []
    lastPrime = bigInt(3)
    checkpoints.push({index:1, prime:3})
  } else {
    lastPrime = bigInt(checkpoints[checkpoints.length-1].prime.value)
  }

  for(var j=checkpoints[checkpoints.length-1].index; j<VLEN; j++){
    while(true) {
      lastPrime = lastPrime.plus(2)
      if(lastPrime.isPrime()) break
    }
    if(j%100 === 0) {
      checkpoints.push({index:j, prime:{value:lastPrime.toString(), sign:false, isSmall:true }})
      console.log('adding ' + lastPrime.toString() + ' to database')
      await checkdb.insertOne({index:j, prime:lastPrime})
    }
  }

  return checkpoints
}

function _addElement(element, accumulator) {
  return accumulator.modPow(element.toString(), N.toString())
}

async function _deleteElement(primes, primedb, xdb, iore) {
  let x = bigInt(1)
  for(var i=0; i<primes.length; i++) {
    x = x.multiply(primes[i].toString())
    await primedb.deleteOne({Prime: primes[i].toString()})
  }
  console.log('deleted '+iore+' primes: '+primes[0]+' to: '+primes[primes.length-1])
  let oldX = xdb.find().limit(1).sort({$natural:-1})
  oldX = await oldX.toArray()
  if(iore === 'i') oldX = bigInt(oldX[0].i)
  if(iore === 'e') oldX = bigInt(oldX[0].e)
  let newX = oldX.divide(x)
  return newX
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
// pointer primes_i: db instance of all inclusion primes
// pointer primes_e: db instance of all exclusion primes
// [] primes_product: product of all primes
async function _getInclusionWitness(v, id_range, ids, primes_i, primes_e, _x){
  let w_i = bigInt(1)
  let w_e = bigInt(1)
  let _x_i = bigInt(_x[0].i)
  let _x_e = bigInt(_x[0].e)

  for(var f=0; f<ids[0].length;f++){
    w_i = w_i.multiply(ids[0][f])
  }
  for(var s=0; s<ids[1].length;s++){
    w_e = w_e.multiply(ids[1][s])
  }

  w_i = _x_i.divide(w_i)
  w_e = _x_e.divide(w_e)

  console.log('calculating new A_i')
  let z_i = g.modPow(w_i, N) // g^x
  console.log('calculating new A_e')
  let z_e = g.modPow(w_e, N) // g^x
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
async function verifyTX(tx, previousBlock, checkpoints, primes_i, primes_e, x) {
  let vector = new Vector_H2P()
  let previousTX
  let checkpoint
  let A_i
  let A_e
  if(tx.inputs[0] !== null) {
    previousTX = previousBlock.txs[tx.inputs[1]]
    console.log(previousTX)
    // require previousTX.to === tx.from
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

    let i
    let oldPrimes
    let x_i
    let x_e
    // this does not work with merging/splitting!
    for(var l=0; l<previousTX.amt; l++) {
      i = _convertIndex(parseInt(previousTX.index[0])+l)
      console.log(parseInt(previousTX.index[0])+l)
      checkpoint = _getCheckpoint(i[0], checkpoints)
      oldPrimes = vector.hash(i, previousTX, checkpoint)
      // delete previousPrimes product from x
      // delete p_i primes from x_i
      x_i = await _deleteElement(oldPrimes[0], primes_i, x, 'i') // dont calculate
      // delete p_e primes from x_e
      x_e = await _deleteElement(oldPrimes[1], primes_e, x, 'e')
    }

    // TODO: this is very slow, use inclusion proofs
    //A_i = g.modPow(x_i, N)
    //A_e = g.modPow(x_e, N)

    // get new primes
    let newPrimes = []
    for(var l=0; l<tx.amt; l++) {
      i = _convertIndex(parseInt(tx.index[0])+l)
      console.log(parseInt(tx.index[0])+l)
      checkpoint = _getCheckpoint(i[0], checkpoints)
      newPrimes.push(vector.hash(i, tx, checkpoint))
    }
    return newPrimes
  } else { // deposit tx
    // todo abi pack tx to bytes?
    let newPrimes = []
    for(var l=0; l<tx.amt; l++) {
      let i = _convertIndex(parseInt(tx.index[0])+l)
      console.log(parseInt(tx.index[0])+l)
      console.log(i)
      checkpoint = _getCheckpoint(i[0], checkpoints) // TODO: bug with first coin where index is 0 (generate primes doesn't have a 0 index, starts at)
      newPrimes.push(vector.hash(i, tx, checkpoint))
    }
    return newPrimes
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
    index: [parseInt(offset)-parseInt(amt),parseInt(offset)],
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
    let database = this.db.collection('Checkpoints')
    this.checkpoints = await _generatePrimeCheckpoints(database)

    let blockdb = this.db.collection('Blocks')
    let tb = await blockdb.find({BlockNumber:0})
    tb = await tb.toArray()
    if(tb[0] === undefined) await blockdb.insertOne({BlockNumber:0, A_i:3, A_e:3, txs:[]})

    let prime_product = this.db.collection('x')
    let x = await prime_product.find({ProductPointer:1})
    x = await x.toArray()
    if(x[0] === undefined) await prime_product.insertOne({ProductPointer:1, i: 1, e: 1})

    // init operator account
    let accountdb = this.db.collection('Accounts')
    let t = await accountdb.find({address:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE'})
    t = await t.toArray()
    if(t[0] === undefined) accountdb.insertOne({address: '0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', balance:1337, coinIDs:[]})

    return this.checkpoints
  }

  async getAccountBalance(address) {
    let accountdb = this.db.collection('Accounts')
    let account = await accountdb.find({address: address})
    account = await account.toArray()
    return account
  }

  async transfer(ins, to, from, start, end) {
    let blocksdb = this.db.collection('Blocks')
    let accountdb = this.db.collection('Accounts')
    let oldBlock = await blocksdb.find().limit(1).sort({$natural:-1})
    oldBlock = await oldBlock.toArray()
    let t = await accountdb.find({address: to})
    t = await t.toArray()
    let f = await accountdb.find({address: from})
    f = await f.toArray()

    // console.log(t[0])
    // console.log(f[0])
    // console.log(weeee)

    let tx = {
      index: [start, end],
      inputs: [ins[0], ins[1]],
      from: from,
      to: to,
      amt: parseInt(end)-parseInt(start),
      sig: '0x1337',
      proof: prf
    }
    console.log(tx)
    let b0 = {BlockNumber:parseInt(oldBlock[0].BlockNumber)+1,txs:[tx]}
    await this.addBlock(b0)
    return true
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

      let coinsf
      let coinst

      // create on function for deposit, one for transfer
      // account database generated from utxo set
      if(block.txs[i].inputs[0] === null) { // handle deposit
        let prevBlock = await blocksdb.find({BlockNumber:parseInt(block.BlockNumber)-1})
        prevBlock = await prevBlock.toArray()

        p_t = await verifyTX(block.txs[i], prevBlock[0], this.checkpoints, primes_i_db, primes_e_db, prime_product)

        if(t[0] === undefined) { // handle new account
          coinst = []
          coinst.push({Block:block.BlockNumber, ID:block.txs[i].index})
          await accountdb.insertOne({address: block.txs[i].to, balance:_amt, coinIDs:coinst})
        } else {
          coinst = t[0].coinIDs
          coinst.push({Block:block.BlockNumber, ID:block.txs[i].index})
          newBal = parseInt(t[0].balance) + parseInt(_amt)
          await accountdb.updateOne({address: block.txs[i].to},{$set:{balance:newBal, coinIDs:coinst}})
        }

        a_i = bigInt(prevBlock[0].A_i)
        a_e = bigInt(prevBlock[0].A_e)
        //store deposit
        await depositsdb.insertOne({address: block.txs[i].to, finalized: true})
      } else { // handle transfer
        coinsf = f[0].coinIDs
        if(t[0] === undefined){
          coinst = []
        } else {
          coinst = t[0].coinIDs
        }

        coinst.push({Block:block.BlockNumber, ID:block.txs[i].index})
        // remove coin from the sender IDs account
        let out = []
        for(var n=0; n<coinsf.length; n++){
          if(coinsf[n].ID[0] !== block.txs[i].index[0]) {
            out.push(coinsf[n])
          }
        }
        coinsf = out

        let parentBlock = await blocksdb.find({BlockNumber:parseInt(block.txs[i].inputs[0])})
        parentBlock = await parentBlock.toArray()

        p_t = await verifyTX(block.txs[i], parentBlock[0], this.checkpoints, primes_i_db, primes_e_db, prime_product)   
        // todo get, a_i and a_e from p_t
        a_i = bigInt(1)
        a_e = bigInt(1)

        if(t[0] === undefined) { // handle new account
          await accountdb.insertOne({address: block.txs[i].to, balance:_amt, coinIDs:coinst})
        } else {
          newBal = parseInt(t[0].balance) + parseInt(_amt)
          await accountdb.updateOne({address: block.txs[i].to},{$set:{balance:newBal, coinIDs:coinst}})
        }

        newBal = parseInt(f[0].balance) - parseInt(block.txs[i].amt)
        await accountdb.updateOne({address: block.txs[i].from}, {$set:{balance:newBal, coinIDs:coinsf}})

        //Todo get a_i and a_e from _deleteElement in verifyTx
        //a_i = incProof[0]
        //a_e = incProof[1]
      }
      // add new elements

      // move this in verify tx
      let x = await prime_product.find({ProductPointer:1})
      x = await x.toArray()
      let _x_i = bigInt(x[0].i)
      let _x_e = bigInt(x[0].e)

      for(var g=0; g<p_t.length; g++) {
        for(var j=0; j<p_t[g][0].length; j++) {
          _x_i = _x_i.multiply(p_t[g][0][j])
          a_i = _addElement(p_t[g][0][j], a_i, N)
          await primes_i_db.insertOne({Prime:p_t[g][0][j].toString()})
        }
        console.log('added inclusion primes: ' +p_t[g][0][0]+' to: '+p_t[g][0][p_t[g][0].length-1])
        for(var k=0; k<p_t[g][1].length; k++) {
          _x_e = _x_e.multiply(p_t[g][1][k])
          a_e = _addElement(p_t[g][1][k], a_e, N)
          await primes_e_db.insertOne({Prime:p_t[g][1][k].toString()})
        }
        console.log('added exclusion primes: ' +p_t[g][1][0]+' to: '+p_t[g][1][p_t[g][1].length-1])
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

  checkDeposit(txhash) {
    let self=this
    return new Promise(async function(resolve,reject) {
      let depositsdb = self.db.collection('Deposits')
      // let deposit = await depositsdb.find({Address:address})
      // deposit = await deposit.toArray()
      await waitForConfirm(txhash, self.web3)
      let receipt = await self.web3.eth.getTransactionReceipt(txhash)
      console.log(receipt.blockHash)

      let event = self.operator.events.Deposit({depositer:receipt.from},{fromBlock:0})

      self.operator.getPastEvents('Deposit',{
        fromBlock:0,
        toBlock: 'latest',
        filter: {depositer:receipt.from}
      }, async (e,l) => {
        for(var i=0; i<l.length; i++) {
          if(l[i].transactionHash === txhash) {
            let blocksdb = self.db.collection('Blocks')
            let oldBlock = await blocksdb.find().limit(1).sort({$natural:-1})
            oldBlock = await oldBlock.toArray()
            let b = _handleDeposit(l[i])
            let h = parseInt(oldBlock[0].BlockNumber)+1
            b['BlockNumber'] = h
            console.log(b)
            await self.addBlock(b)
            let res = {offset:l[i].returnValues.offset, block:h}
            resolve(res) // todo get  blocknum from db
          }
        }
      })
    })
  }
}

module.exports = Operator