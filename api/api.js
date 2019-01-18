var appRouter = function (app) {

  app.get("/", function(req, res) {
    res.status(200).send("Welcome to our restful API")
  })

  app.get("/getAccountBalance", function(req, res) {
    // parse req for address
    res.status(200).send("ids the address owns")
  })

  app.get("/checkDeposit", function(req, res) {
    // parse req for address and amt
    res.status(200).send("deposit status")
  })

  app.get("/getIDs", function(req, res) {
    // parse req for address
    res.status(200).send("IDs")
  })

  app.get("/submitTransaction", function(req, res) {
    // parse req for tx
    res.status(200).send("tx status")
  })

  app.get("/checkIDs", function(req, res) {
    // parse req for ids
    res.status(200).send("ids status")
  })
}

module.exports = appRouter;