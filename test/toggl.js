var expect = require("chai").expect;
var togglAPI = require("../app/Toggl.js");

describe("Our toggl API test account ", function() {
  this.timeout(15000);
  describe("Users in toggl cache", function() {
    it("should have nothing", function() {

    });
  });
  describe("users", function() {
    it("should have mike", function() {
      return togglAPI.getUser('mikerobertking@gmail.com').then(function(user) {
        expect(user).to.exist;
        expect(user.email).to.be.equal('mikerobertking@gmail.com');
      });
    });
    it("shouldn't have fakemike", function() {
      return togglAPI.getUser('fakemikerobertking@gmail.com').then(function(users) {

      }, function(err) {
        // TODO add expected error type assertion
          expect(err).to.exist;
      });
    });
  });
});
