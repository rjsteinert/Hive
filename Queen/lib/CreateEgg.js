var log = require('../../util/log.js')
var Settings = require('../../Settings')
var HiveBackbone = require('../../HiveBackbone/HiveBackbone')

var express = require('express');
var Backbone = require('backbone')
var request = require('request-json')

var queenClient = request.newClient(Settings.Queen.URL)

module.exports = function(eggInfo, callback) {
	var egg = new HiveBackbone.Models.Egg(eggInfo)
  egg.on('sync', function() {
    queenClient.post(
      'http://127.0.0.1:125/egg/hatch', 
      {
        "beeAddress": egg.get('address'), 
        "name": "New Bee #" + (new Date()).getTime()
      },
      function(err, response, body) {
        if(!err) {
          callback(null, 'ok')
        }
        else {
          callback("fail", "Error: " + err)
        }
      }
    )
  })
  egg.save()
}


ll