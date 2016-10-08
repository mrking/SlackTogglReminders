var expect = require("chai").expect;
var togglAPI = require("../app/Toggl.js");

describe("Our toggl API test account", function() {
  this.timeout(10000);
  describe("users", function() {
      it("shouldn't be cached yet on init", function() {
          expect(togglAPI.getCachedUsers()).to.be.empty;
      });
      it("should have mike and at least two users cached", function(done) {
          return togglAPI.getUser('mikerobertking@gmail.com').then(function(user) {
              expect(user).to.exist;
              expect(user.email).to.equal('mikerobertking@gmail.com');
              expect(togglAPI.getCachedUsers()).to.exist;
              expect(Object.keys(togglAPI.getCachedUsers()).length).to.be.at.least(2);
          }, function(err) {
            assert.isNotOk(err,'ran into error trying to get mike');
          }).then(done);
      });
  });
  describe("workspaces", function() {
    it("should resolve a workspace name into a workspace id", function(done) {
      var workspace_name = "Lexicon";

      return togglAPI.getWorkspaceID(workspace_name).then(function(workspace_id) {
        console.log(workspace_id);
        expect(workspace_id).to.exist;
        expect(workspace_id).to.be.at.least(0);
          console.log("WORKSPACE");
        done();
      }, function(err) {
        assert.isNotOk(err,'ran into error trying to get workspace');
        done();
      });
    });
  });
  describe("Time reporting", function() {
    it("should have any reported number of hours for tyrone", function(done) {
        var startPeriod = new Date();
        startPeriod.setDate(startPeriod.getDate() - 7);
        console.log("dates set as variables");

        return togglAPI.getTimeSpent(startPeriod, new Date(), "new.overlord@gmail.com").then(function(report) {
          console.log("trying to access tyrone's time report");
          console.log(report);
            expect(report).to.exist;
            expect(report.total_grand).to.be.at.least(0);
            done();
            //expect(user.email).to.equals("new.overlord@gmail.com")
        }).catch(function(err) {
          assert.isNotOk(err, "ran into an error trying to access tyrone's time report");
          done();
        });
    });
  });
});
