var expect = require("chai").expect;
var togglAPI = require("../app/Toggl.js");

describe("Our toggl API test account ", function() {
  this.timeout(15000);
  describe("users in toggl cache", function() {
    it("should have nothing at init", function() {
      expect(togglAPI.getCachedUsers()).to.be.empty;
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
      it("BLAH", function() {
        var email = "lasdflaksdjflkasjdf@laksflasd.com";

        toglAPI.getUser(email).then(function(user) {
          expect(err).to.exist;
          expect(user).to.equals('unable to find ' + email +  ' in toggl')
        });
      });
      it("BLAH", function() {
        var email = "new.overlord@gmail.com";

        toglAPI.getUser(email).then(function(user) {
          expect(user.id).to.exist;
          expect(user.email).to.equals("new.overlord@gmail.com")
        });
        it("BLAH", function() {
          var email = "new.overlord@gmail.com";
          var startPeriod = new Date();
          startPeriod.setDate(startPeriod.getDate() - USER_MIN_HOURS_IN_DAYS);

          toglAPI.getTimeSpent(new Date, startPeriod, email).then(function(report) {
            expect(report).to.exist;
            //expect(user.email).to.equals("new.overlord@gmail.com")
          });
  });


  });
});
});
