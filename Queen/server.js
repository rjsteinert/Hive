var log = require('../util/log.js')
var Settings = require('../Settings')
var HiveBackbone = require('../HiveBackbone/HiveBackbone')

var express = require('express');
var Backbone = require('backbone')
var request = require('request-json')

var queenClient = request.newClient(Settings.Queen.URL)
var server = express()

server.use(express.bodyParser())

server.post('/egg/new', function(req, res){
  var createEgg = require('./lib/CreateEgg.js')
  createEgg(req.body, function(err, message) {
    log('CreateEgg', message)
    res.send('ok')
  })
})

server.post('/egg/hatch', function(req, res){
  var hatchEgg = require('./lib/HatchEgg.js')
  hatchEgg(req.body, function(err, message) {
    log('HatchEgg', message)
    res.send('ok')    
  })
})

server.listen(125)
log('Queen', 'server listening on port 125')
