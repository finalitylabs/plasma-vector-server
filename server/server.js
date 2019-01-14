var express = require("express")
var bodyParser = require("body-parser")
var api = require("../api/api.js")
var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

api(app)

var server = app.listen(8546, function () {
    console.log("operator running on port.", server.address().port)
})