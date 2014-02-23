var expect = require('chai').expect

describe("HatchEgg", function() {
	this.timeout(15000)
  it("return with no error", function(done) {
		var hatchEgg = require('../lib/HatchEgg.js')
		var eggInfo = {
	    "beeAddress": "60:c5:47:04:f1:94",
	    "name": "BravoBee"
	  }
		hatchEgg(eggInfo, function(err, message) {
		  expect(err).to.equal(null)
		  done()    
		})
	})
})
