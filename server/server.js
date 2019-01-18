var express = require("express")
var bodyParser = require("body-parser")
var api = require("../api/api.js")
const OP = require('./Operator')
var app = express()
var cors = require('cors')

const op = new OP()
// init some block data
let operator = '0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE'
let tx0 = {checkpoint_i: 700, checkpoint_p: 5273, index: 3, inputs:[0,0], from:operator, to:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', amt:0.0001, sig:'0x1337', proof: '0x0' }
let tx1 = {checkpoint_i: 500, checkpoint_p: 3581, index: 2, inputs:[0,0], from:operator, to:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', amt:0.0001, sig:'0x1337', proof: '0x0' }
let b0 = [tx0, tx1]
let primes = op.addBlock(b0)

var whitelist = [
  'http://localhost:8080',
]

var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  credentials: true
}

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

api(app, op)

var server = app.listen(8546, function () {
  console.log("operator running on port.", server.address().port)
})