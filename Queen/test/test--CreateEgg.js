var expect = require('chai').expect

describe("CreateEgg", function() {
	this.timeout(15000)
  it("return with no error", function(done) {
		var createEgg = require('../lib/CreateEgg.js')
		var egg = {
		  "sensors": ["0x01", "0x02", "0x10", "0x11", "0x12", "0x15", "0x13", "0x14", "0x16", "0x17", "0x17", "0x17"],
		  "address": "60:c5:47:04:f1:94"
		}
		createEgg(egg, function(err, message) {
		  expect(err).to.equal(null)
		  done()    
		})
	})
})

