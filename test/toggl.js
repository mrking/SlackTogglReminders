var expect = require("chai").expect;
var togglAPI = require("../app/Toggl.js");

describe("Toggl client", function() {
  describe("Users in slack cache", function() {
    it("should have nothing at init", function() {
      expect(toglAPI.getCachedUsers()).to.be.empty;
    });
  });

  describe("Cannot find slack user", function() {
    it("BLAH", function() {
      var email = "lasdflaksdjflkasjdf@laksflasd.com";

      toglAPI.getUser(email).then(function(user) {
        expect(err).to.exist;
        expect(user).to.equals('unable to find ' + email +  ' in toggl')
      });
    });
  });

  describe("Can find slack user", function() {
    it("BLAH", function() {
      var email = "new.overlord@gmail.com";

      toglAPI.getUser(email).then(function(user) {
        expect(user.id).to.exist;
        expect(user.email).to.equals("new.overlord@gmail.com")
      });
    });
  });

  describe("Get a time report on slack user", function() {
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
