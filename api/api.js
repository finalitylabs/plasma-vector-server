const async = require('asyncawait/async')
var appRouter = function (app, op) {

  app.get("/", function(req, res) {
    res.status(200).send("Welcome to Plasma Vector Server")
  })

  app.post("/getAccountBalance", async function(req, res) {
    let bal = await op.getAccountBalance(req.body.user)
    if(bal.length === 0) bal = 0
    res.status(200).send(bal[0].balance)
  })

  app.post("/checkDeposit", async function(req, res) {
    // parse req for address and amt
    let deposit = await op.checkDeposit(req.body.address)
    res.status(200).send("deposit status")
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