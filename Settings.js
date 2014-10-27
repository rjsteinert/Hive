module.exports = {
  domain: "grove4.local",
  path: "/root/Hive",
  Queen: {
    URL: "http://127.0.0.1:125"
  },
  Honeycomb: {
    URL: "http://127.0.0.1:126"
  },
  Beekeeper: {
    path: "/root/Hive/Beekeeper"
  },
  CouchDB: {
    URL: "http://admin:password@127.0.0.1:5984"
  },
  API: {
    URL: "https://api.apitronics.com/v1/"
  },
  'harvestHoneyJarsFrequencyInMinutes': 5,
  'tellCouchDbAboutDrivesFrequencyInMinutes': 5
};
