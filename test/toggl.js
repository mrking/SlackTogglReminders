var expect = require("chai").expect;
var assert = require('chai').assert;
var togglAPI = require("../app/Toggl.js");

// These tests are not fully unit,
// closer to being integration tests,
// but achieve the same purpose.


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
                done();
            }, function(err) {
                assert.isNotOk(err, 'ran into error trying to get mike');
                done();
            }).catch(done);
        });
        it("Sith Lord Mike King should not build get hold of the Toggl", function(done) {
            return togglAPI.getUser('sithmikeking@gmail.com').then(function(user) {
                assert.isNotOk(err, 'a disturbance in the force has been felt');
                done();
            }, function(err) {
                // TODO match error code to files
                expect(err).to.exist;
                done();
            }).catch(done);
        });
    });
    describe("workspaces", function() {
        it("should resolve a workspace name into a workspace id", function(done) {
            var workspace_name = "Lexicon";

            return togglAPI.getWorkspaceID(workspace_name).then(function(workspace_id) {
                expect(workspace_id).to.exist;
                expect(workspace_id).to.be.at.least(0);
                done();
            }, function(err) {
                assert.isNotOk(err, 'ran into error trying to get workspace');
                done();
            }).catch(done);
        });
        it("should error on a fake workspace name into a workspace id", function(done) {
            var workspace_name = "FakeLexicon";

            return togglAPI.getWorkspaceID(workspace_name).then(function(workspace_id) {
                assert.isNotOk(workspace_id, 'found a fake workspace it should not have found');
                done();
            }, function(err) {
                expect(err).to.exist;
                done();
            }).catch(function() {
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
                expect(report).to.exist;
                console.log("report exists");
                expect(report).to.be.at.least(0);
                console.log("report total_grand > 0");
                done();
                //expect(user.email).to.equals("new.overlord@gmail.com")
            }, function(err) {
                assert.isNotOk(err, 'ran into error trying to get reported number of hours for tyrone');
                done();
            }).catch(function(err) {
                assert.isNotOk(err, "ran into an error trying to access tyrone's time report");
                done();
            });
        });
    });
});
