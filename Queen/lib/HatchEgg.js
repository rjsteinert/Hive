var log = require('../../util/log.js')
var Settings = require('../../Settings')
var HiveBackbone = require('../../HiveBackbone/HiveBackbone')

var express = require('express');
var Backbone = require('backbone')

module.exports = function(egg, callback) {

  var ev = new Backbone.Model()
  var beeAddress = egg.beeAddress
  var egg = new HiveBackbone.Models.Egg()
  var bee = new HiveBackbone.Models.Bee({address: beeAddress, name: egg.name})
  var sensors = new HiveBackbone.Collections.Sensors() 

  // Find the unhatched Egg by beeAddress
  ev.on('0', function() {
    var unhatchedEggsByBeeAddress = new HiveBackbone.Collections.UnhatchedEggsByBeeAddress()
    unhatchedEggsByBeeAddress.params.beeAddress = beeAddress
    unhatchedEggsByBeeAddress.once('sync', function() {
      egg = unhatchedEggsByBeeAddress.models[0]
      ev.trigger('1')
    })
    unhatchedEggsByBeeAddress.fetch()
  })

  // Create the Bee in the config database
  ev.on('1', function() {
    bee.once('sync', function() {
      ev.trigger('2')
    })
    bee.save()
  })

  // Produce Sensor docs from Egg
  ev.on('2', function() {
    var i = 0
    egg.attributes.sensors.forEach(function(sensor) {
      var sensor = new HiveBackbone.Models.Sensor({
        "order": i,
        "beeId": bee.id,
        "sensorDefinitionFirmwareUUID": sensor 
      })
      sensors.add(sensor)
      i++
    })
    ev.trigger('3') 
  })

  // Create the Sensors in the config database
  ev.on('3', function() {
    sensors.once('sync', function() {
      ev.trigger('4')
    })
    sensors.save()
  })

  // Update the Egg as hatched
  ev.on('4', function() {
    egg.set('hatched', true)
    egg.once('sync', function() {
      ev.trigger('5')
    })
    egg.save()
  })

  ev.on('5', function() {
    callback(null, 'ok')
  })

  ev.trigger('0')
}