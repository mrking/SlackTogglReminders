var expect = require("chai").expect;
var togglAPI = require("../app/Toggl.js");

describe("Our toggl API test account", function() {
  this.timeout(10000);
  describe("users", function() {
      it("shouldn't be cached yet on init", function() {
          expect(togglAPI.getCachedUsers()).to.be.empty;
      });
      it("should have mike and then one user cached", function(done) {
          togglAPI.getUser('mikerobertking@gmail.com').then(function() {
            console.log('this part seems to work');
          });
          return togglAPI.getUser('mikerobertking@gmail.com').then(function(user) {
            console('but we never reach here for some reason');
              expect(user).to.exist;
              expect(user.email).to.equal('mikerobertking@gmail.com');
              expect(togglAPI.getCachedUsers()).to.exist;
              expect(togglAPI.getCachedUsers().length).to.equal(1);
              done();
          }, function(err) {
            assert.isNotOk(err,'ran into error trying to get mike');
            done();
          });
      });/*
      it("shouldn't have fakemike", function(done) {
          return togglAPI.getUser('fakemikerobertking@gmail.com').then(function(users) {

          }, function(err) {
              // TODO add expected error type assertion
              expect(err).to.exist;
              done();
          });
      });
      it("should have any reported number of hours for tyrone", function(done) {
          var startPeriod = new Date();
          startPeriod.setDate(startPeriod.getDate() - 7);

          return togglAPI.getTimeSpent(new Date(), startPeriod, "new.overlord@gmail.com").then(function(report) {
              expect(report).to.exist;
              done();
              //expect(user.email).to.equals("new.overlord@gmail.com")
          });
      });*/
  });
});
