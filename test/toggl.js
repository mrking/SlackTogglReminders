var expect = require("chai").expect;
var assert = require('chai').assert;
var togglAPI = require("../app/Toggl.js");

// These tests are not fully unit,
// closer to being integration tests,
// but achieve the same purpose.

describe("Our toggl API test account", function() {
    this.timeout(15000);
    describe("users", function() {
        it("shouldn't be cached yet on init", function() {
            assert(Object.keys(togglAPI.getCachedUsers()).length === 0);
        });
        it("should have mike and at least two users cached", function() {
            return togglAPI.getUser('mikerobertking@gmail.com').then(function(user) {
                expect(user).to.exist;
                expect(user.email).to.equal('mikerobertking@gmail.com');
                expect(togglAPI.getCachedUsers()).to.exist;
                expect(Object.keys(togglAPI.getCachedUsers()).length).to.be.at.least(2);
            });
        });
        it("Sith Lord Mike King should not build get hold of the Toggl", function() {
            return togglAPI.getUser('sithmikeking@gmail.com').then(function(user) {
                assert.isNotOk(err, 'a disturbance in the force has been felt');
            }, function(err) {
                // TODO match error code to files
                expect(err).to.exist;
            });
        });
    });
    describe("workspaces", function() {
        it("should resolve a workspace name into a workspace id", function() {
            var workspace_name = "Lexicon";

            return togglAPI.getWorkspaceID(workspace_name).then(function(workspace_id) {
                expect(workspace_id).to.exist;
                expect(workspace_id).to.be.at.least(0);
            }, function(err) {
                assert.isNotOk(err, 'ran into error trying to get workspace');
            });
        });
        it("should error on a fake workspace name into a workspace id", function() {
            var workspace_name = "FakeLexicon";

            return togglAPI.getWorkspaceID(workspace_name).then(function(workspace_id) {
                assert.isNotOk(workspace_id, 'found a fake workspace it should not have found');
            }, function(err) {
                expect(err).to.exist;
                console.log(err.getErrorCode());

                expect(err.getMessage()).to.exist;
                expect(err.getErrorCode()).to.exist;
                assert(err.getErrorCode() === togglAPI.error.prototype.ERROR_CODE_WORKSPACE_ID_UNAVAILABLE );
            });
        });
    });
    describe("Time reporting", function() {
        it("should have any reported number of hours for tyrone", function() {
            var startPeriod = new Date();
            startPeriod.setDate(startPeriod.getDate() - 7);
            console.log("dates set as variables");

            return togglAPI.getTimeSpent(startPeriod, new Date(), "new.overlord@gmail.com").then(function(report) {
                console.log("trying to access tyrone's time report");
                expect(report).to.exist;
                console.log("report exists");
                expect(report).to.be.at.least(0);
                console.log("report total_grand > 0");
                //expect(user.email).to.equals("new.overlord@gmail.com")
            }, function(err) {
                assert.isNotOk(err, 'ran into error trying to get reported number of hours for tyrone');
            }).catch(function(err) {
                assert.isNotOk(err, "ran into an error trying to access tyrone's time report");
            });
        });
    });
});
