$(function() {
  App.Router = new (Backbone.Router.extend({

    routes: {
      '' : 'Bees',
      'bees' : 'Bees',
      'bee/:beeId' : 'Bee',
      'bee/edit/:beeId' : 'BeeForm',
      'sensor/:sensorId' : 'Sensor',
      'sensor/edit/:beeId/:sensorId' : 'SensorForm',
      'recipe/add/:beeId' : 'RecipeAdd',
      'recipe/:triggerId' : 'Recipe',
      'settings' : 'Settings'
    },

    
    Settings: function() {
      
      var ev = new Backbone.Model()
      
      var settings = new App.Models.Settings()
      var settingsForm = new App.Views.SettingsForm()

      var drives = new App.Collections.Drives()
      var drivesTable = new App.Views.DrivesTable()

      settingsForm.once('done', function() {
        Backbone.history.navigate('', {trigger: true})
      })
      
      App.clear()
      App.append(settingsForm.el)
      App.append(drivesTable.el)

      ev.once('A0', function() {
        settings.fetch({success: function() {
          ev.trigger('A1')
        }})
      })

      ev.once('A1', function() {
        settingsForm.model = settings
        settingsForm.render()
      })

      ev.once('B0', function() {
        drives.on('sync', function() {
            ev.trigger('B1')
        })
        drives.fetch({success: function() {
          ev.trigger('B1')
        }})
      })

      ev.once('B1', function () {
        drivesTable.collection = drives
        drivesTable.render()
      })

      ev.trigger('A0')
      ev.trigger('B0')

    },


    Bees: function() {
        
      App.setTitle('Your Hive')
      
      // setup
      var ev = new Backbone.Model()
      
      var bees = new App.Collections.Bees()
      var beesTable = new App.Views.BeesTable()  
      
      App.clear()
      App.append(beesTable.el)
      
      // Fetch the Bees Collection and give it to beesTable
      ev.once('0', function() {
        bees.fetch({success: function(collection, response, options){
          beesTable.collection = bees
          ev.trigger('1')
        }})
      })
      
      // Render the beesTable View
      ev.once('1', function() {
        beesTable.render()
      })
    
      ev.trigger('0')      

    },


    Bee: function(beeId) {
      
      App.setTitle('')
      
      //
      // setup
      //
      
      var ev = new Backbone.Model()
      
      var bee = new App.Models.Bee({"_id": beeId})
      var beeSensors = new App.Collections.BeeSensors()
      var beeRecipes = new App.Collections.BeeRecipes()
      
      var beeSensorsTable = new App.Views.BeeSensorsTable()
      var beeRecipesTable = new App.Views.BeeRecipesTable()
      
      App.clear()
      App.append(beeSensorsTable.el)
      App.append(beeRecipesTable.el)
      
      //
      // Thread AX - Sensors
      //
      
      // Fetch the beeSensors
      ev.once('A0', function() {
        beeSensors.params.beeId = beeId
        beeSensors.fetch({success: function(collection, response, options){
          ev.trigger('A1')
        }})
      })

      ev.once('A1', function() {
        beeSensors.once('loadSensorDefinitions:done', function() {
          ev.trigger('A2') 
        })
        beeSensors.loadSensorDefinitions()
      })

      ev.once('A2', function() {
        beeSensors.once('loadLastSensorReadings:done', function() {
          ev.trigger('A3')
        })
        beeSensors.loadLastSensorReadings()
      })
      
      // Render the beeSensorsTable
      ev.once('A3', function() { 
        beeSensorsTable.collection = beeSensors 
        beeSensorsTable.render()
        ev.trigger('B0')
      })
      
      //
      // Thread BX - Recipes
      //

      // Fetch the beeRecipes
      ev.once('B0', function() {   
        beeRecipes.params.beeId = beeId
        beeRecipes.fetch({success: function(collection, response, options){
          ev.trigger('B1')
        }})
      })
      
      // Render the beeSensorsTable
      ev.once('B1', function() { 
        beeRecipesTable.collection = beeRecipes 
        beeRecipesTable.render()
      })

      //
      // Thread CX - The Bee
      
      ev.once('C0', function() {
        bee.fetch({complete:function(){ ev.trigger('C1')}})
      })
      
      ev.once('C1', function() {
        App.setTitle(bee.get('name'))
      })

      //
      // threads
      // 
      
      ev.trigger('A0')
      // ev.trigger('B0') // Starts at end of AX
      ev.trigger('C0')

    },
    

    BeeForm: function(beeId) {
        
      App.setTitle('')
      
      var bee = new App.Models.Bee()
      var form = new App.Views.BeeForm({model: bee})
      App.$el.children('.body').html(form.el)
      form.once('Form:done', function() {
        Backbone.history.navigate('', {trigger: true})
      })
      if (beeId) {
        bee.id = beeId
        bee.fetch({success: function() {
          form.render()  
        }})
      }
      else {
        form.render()
      }
    },


    SensorForm: function(beeId, sensorId) {
        
      App.setTitle('')
      
      var modelId = sensorId
      var modelClass = 'Sensor'
      var formClass = 'SensorForm'
      redirect = 'bee/' + beeId
      
      // Boiler Backbone.js helper code for a Form Route to do CRUD operations on a Model.
      // https://gist.github.com/rjsteinert/9494916
      var model = new App.Models[modelClass]()
      var form = new App.Views[formClass]({model: model})
      App.$el.children('.body').html(form.el)
      form.once('Form:done', function() {
        Backbone.history.navigate(redirect, {trigger: true})
      })
      if (modelId) {
        model.id = modelId
        model.fetch({success: function() {
          form.render()  
        }})
      }
      else {
        form.render()
      }
    },


    Sensor: function(sensorId, startDate, endDate) {
        
      App.setTitle('')
      
      //
      // setup
      //
      
      var ev = new Backbone.Model()
      
      var sensor = new App.Models.Sensor({_id: sensorId})
      App.sensorReadingsGraph = new App.Views.SensorReadingsGraph()
      
      App.clear()
      App.append(App.sensorReadingsGraph.el)
      
      //
      // Figure out which collection to use 
      //
      
      // Figure out the range parameters for the Collection...
      
      // ... from URL
      if (startDate && endDate) {
        App.startDate = startDate
        App.endDate = endDate
      }
      // ... from fallback Defaults
      else if (!App.startDate && !App.endDate) {
        // Last 24 hours from now
        App.startDate = moment().unix()-(60*60*24*1)
        App.endDate = moment().unix()
      }
      
      // Estimate the points we'll receive given the date range we now know of
      var estimatedPointsOnScreenUnreduced = (App.endDate - App.startDate) / App.sampleInterval
      
      // Now we can set the Collection on the View
      if (estimatedPointsOnScreenUnreduced > App.maxPointsOnScreen) {  
        App.sensorReadingsGraph.collection = new App.Collections.SensorJarHourlyAverageReadings()
      }
      else {
        App.sensorReadingsGraph.collection = new App.Collections.SensorReadings()
      }
      
      // Set params for the Collection
      App.sensorReadingsGraph.collection.params.startDate = App.startDate
      App.sensorReadingsGraph.collection.params.endDate = App.endDate
      App.sensorReadingsGraph.collection.params.sensorId = sensorId
      
      // Fetch Sensor
      ev.once('0', function() {
        sensor.on('sync', function() {
          ev.trigger('1')
        })
        sensor.fetch()
      })
      
      // Assign the sensor to its graph and prepare with spinner
      ev.once('1', function() {
        sensor.once('loadSensorDefinition:done', function() {
          if(sensor.get('name'))
            App.setTitle(sensor.get('name'))
          else
            App.setTitle(sensor.sensorDefinition.get('name'))
        })
        sensor.loadSensorDefinition()
        App.sensorReadingsGraph.sensor = sensor
        App.sensorReadingsGraph.prepare()
        ev.trigger('2')
      })

      // Fetch the sensorReadings Collection
      ev.once('2', function() {
        App.sensorReadingsGraph.collection.on('sync', function() {
          ev.trigger('3')
        })
        App.sensorReadingsGraph.collection.fetch()
      })
      
      // Render the graph View
      ev.once('3', function() {
        App.sensorReadingsGraph.render()
      })

      ev.trigger('0')
  
      
    },

    RecipeAdd: function(beeId) {
        

      var ev = new Backbone.Model()
      
      var recipe = new App.Models.Recipe()
      var recipeForm = new App.Views.RecipeForm({model: recipe})
      var beeSensors = new App.Collections.BeeSensors()

      beeSensors.params.beeId = beeId
      recipe.set('beeId', beeId)

      App.setTitle('')
      App.clear()
      App.append(recipeForm.el)

      recipeForm.once('done', function() {
        Backbone.history.navigate('bee/' + beeId, {trigger: true})
      })

      ev.once('0', function() {
        beeSensors.on('sync', function() {
          ev.trigger('1')
        })
        beeSensors.fetch()
      })

      ev.once('1', function() {
        beeSensors.on('loadSensorDefinitions:done', function() {
          ev.trigger('2')
        })
        beeSensors.loadSensorDefinitions()
      })

      ev.once('2', function() {
        recipe.schema.sensor.options = _.map(beeSensors.models, function(model) {
          if(model.get('name'))
            return {val: model.id, label: model.get('name') }
          else
            return {val: model.id, label: model.sensorDefinition.get('name') }
        })
        recipeForm.render()
      })

      ev.trigger('0')
    },

    Recipe: function(recipeId) {

      var ev = new Backbone.Model()
      
      var recipe = new App.Models.Recipe()
      var beeSensors = new App.Collections.BeeSensors()
      var recipeForm = new App.Views.RecipeForm({model: recipe})

      recipe.id = recipeId

      App.setTitle('')
      App.clear()
      App.append(recipeForm.el)


      recipeForm.once('done', function() {
        Backbone.history.navigate('bee/' + recipe.get('beeId'), {trigger: true})
      })

      ev.once('0', function() {
        recipe.once('sync', function() {
          ev.trigger('1')
        })
        recipe.fetch()
      })

      ev.once('1', function() {
        beeSensors.params.beeId = recipe.get('beeId')
        beeSensors.on('sync', function() {
          ev.trigger('2')
        })
        beeSensors.fetch()
      })

      ev.once('2', function() {
        beeSensors.on('loadSensorDefinitions:done', function() {
          ev.trigger('3')
        })
        beeSensors.loadSensorDefinitions()
      })

      ev.once('3', function() {
        recipe.schema.sensor.options = _.map(beeSensors.models, function(model) {
          if(model.get('name'))
            return {val: model.id, label: model.get('name') }
          else
            return {val: model.id, label: model.sensorDefinition.get('name') }
        })
        recipeForm.render()
      })

      ev.trigger('0')

    }

  }))

})
