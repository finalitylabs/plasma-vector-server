const async = require('asyncawait/async')
var appRouter = function (app, op) {

  app.get("/", function(req, res) {
    res.status(200).send("Welcome to Plasma Vector Server")
  })

  app.post("/getAccountBalance", async function(req, res) {
    let bal = await op.getAccountBalance(req.body.user)
    if(bal.length === 0) {
      bal = 0
      res.status(200).send('0')
    }else {
      res.status(200).send(bal[0].balance.toString())
    }
  })

  app.post("/transfer", async function(req, res) {
    // parse req for address and amt
    let transfer = await op.transfer(req.body.ins, req.body.to, req.body.from, req.body.indexes, req.body.amt)
    console.log('new block number: ' + transfer)
    res.status(200).send({block:transfer})
  })

  app.post("/deposit", async function(req, res) {
    // parse req for address and amt
    console.log(req.body)
    let offset = await op.checkDeposit(req.body.txhash)
    console.log(offset)
    res.status(200).send(offset)
  })

  app.post("/received", async function(req, res) {
    // parse req for address
    let coins
    let account = await op.getAccountBalance(req.body.user)
    if(account[0] === undefined) {
      coins = []
    } else {
      //console.log(account[0].coinIDs[0].ID)
      coins = account[0].coinIDs
    }
    res.status(200).send(coins)
  })

  app.post("/getIDs", function(req, res) {
    // parse req for address
    res.status(200).send("IDs")
  })

  app.post("/submitTransaction", function(req, res) {
    // parse req for tx
    res.status(200).send("tx status")
  })

  app.post("/getInclusionProof", function(req, res) {
    // parse req for ids
    let proof = op.getSingleInclusionProof(req.body.value, [0,0])
    res.status(200).send(proof)
  })

  // this should be a client call to blockchain
  app.post("/checkIDs", function(req, res) {
    // parse req for ids
    res.status(200).send("ids status")
  })
}

module.exports = appRouter;