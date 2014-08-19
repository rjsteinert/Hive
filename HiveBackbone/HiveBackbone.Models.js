var _ = require('underscore')
var Backbone = require('backbone')
var Settings = require('../Settings')
var nano = require('nano')(Settings.CouchDB.URL)
var moment = require('moment')

module.exports = {

  Recipe: Backbone.Model.extend({
    idAttribute: "_id",
    setState: function(state) {
      this.set('state', [moment().utc().unix(), state])
    },
    defaults: {
      kind: "Recipe",
      state: "on",
      lastTriggered: null
    },
    sync: require('./lib/ConfigDbSyncAdapter.js')
  }),

  Swarm: Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
      kind: "Swarm",
      beeAddresses: []
    },
    sync: function (method, model, options) {
      var db = nano.use('swarms')
      var data = model.toJSON()
      if (model.hasOwnProperty('id')) {
        data._id = model.id
      }
      if (data.hasOwnProperty('rev')) {
        data._rev = model.rev
        delete data.rev
      }
      switch (method) {
        case 'create':
          db.insert(model.toJSON(), function(err, body) {
            body._id = body.id
            delete body.id
            body._rev = body.rev
            delete body.rev
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'read':
          db.get(model.id, null, function(err, body) {
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'update':
          db.insert(model.toJSON(), function(err, body) {
            body._id = body.id
            delete body.id
            body._rev = body.rev
            delete body.rev
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'delete':
          db.destroy(model.id, model.get('_rev'), function(err, body) {
            model.trigger('sync')
          })
          break;
      }
    }
  }),

  Egg: Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
      kind: "Egg",
      hatched: false
    },
    sync: function (method, model, options) {
      var db = nano.use('incubator')
      switch (method) {
        case 'create':
          db.insert(model.toJSON(), function(err, body) {
            body._id = body.id
            delete body.id
            body._rev = body.rev
            delete body.rev
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'read':
          db.get(model.id, null, function(err, body) {
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'update':
          db.insert(model.toJSON(), function(err, body) {
            body._id = body.id
            delete body.id
            body._rev = body.rev
            delete body.rev
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'delete':
          db.destroy(model.id, model.get('_rev'), function(err, body) {
            model.trigger('sync')
          })
          break;
      }
	  }
  }),

  Bee: Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
      kind: "Bee",
    },
    sync: function (method, model, options) {
      var db = nano.use('config')
      var data = model.toJSON()
      if (model.hasOwnProperty('id')) {
        data._id = model.id
      }
      if (data.hasOwnProperty('rev')) {
        data._rev = model.rev
        delete data.rev
      }
      switch (method) {
        case 'create':
          db.insert(model.toJSON(), function(err, body) {
            body._id = body.id
            delete body.id
            body._rev = body.rev
            delete body.rev
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'read':
          db.get(model.id, null, function(err, body) {
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'update':
          db.insert(model.toJSON(), function(err, body) {
            body._id = body.id
            delete body.id
            body._rev = body.rev
            delete body.rev
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'delete':
          db.destroy(model.id, model.get('_rev'), function(err, body) {
            model.trigger('sync')
          })
          break;
      }
	  }
  }),

  Sensor: Backbone.Model.extend({
    idAttribute: ('_id'),
    defaults: {
      kind: 'Sensor'
    },
    dbName: function() {
      return 'sensor_' + this.id
    },
    sync: function (method, model, options) {
      var db = nano.use('config')
      var sensor = model
      switch (method) {
        case 'create':
          db.insert(model.toJSON(), function(err, body) {
            body._id = body.id
            delete body.id
            body._rev = body.rev
            delete body.rev
            model.set(body)
            nano.db.create('sensor_' + model.id, function(err, body) {
              if (!err) {
                model.trigger('sync')
              }
              else {
                console.log('Sensor without a database detected!')
              }
            })
          })
          break;
        case 'read':
          db.get(model.id, null, function(err, body) {
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'update':
          db.insert(model.toJSON(), function(err, body) {
            body._id = body.id
            delete body.id
            body._rev = body.rev
            delete body.rev
            model.set(body)
            model.trigger('sync')
          })
          break;
        case 'delete':
          db.destroy(model.id, model.get('_rev'), function(err, body) {
            model.trigger('sync')
          })
          break;
      }
    }
  }),

  Reading: Backbone.Model.extend({
    //idAttribute: "_id", // this gets fuzzy with readings, it's best not to treat _id as id
    params: {
      // Optional param for determining where to save this reading
      dbName: null
    },
    sync: function (method, model, options) {
      // Detect the database
      // @todo There are a lot of ways to do this. Probably too many.
      if(this.params.dbName) {
        var db = nano.use(model.params.dbName)
      }
      else if (model.get('dbName')) {
        var db = nano.use(model.get('dbName'))
      }
      else if (model.get('sensorId')) {
        var db = nano.use('sensor_' + model.get('sensorId'))
      }
      else {
        console.log("error: could not determine Reading's database during sync operation.")
      }
      switch (method) {
        case 'create':
          db.insert({_id: (model.get('timestamp')).toString(), d: model.get('d')}, function(err, body) {
            if(err) return console.log(err)
            model.set('_rev', body.rev)
            model.trigger('sync')
          })
          break;
      }
    }
  })

}
