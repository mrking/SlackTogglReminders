var expect = require("chai").expect;
var assert = require('chai').assert;
var slackAPI = require("../app/Slack.js");

// These tests are not fully unit,
// closer to being integration tests,
// but achieve the same purpose.

describe("Our slack API test account", function() {
    this.timeout(10000);
    describe("user", function() {
        it("should authenticate and have a bot name", function() {
            return slackAPI.getBotName().then(function(name){
                expect(name.length).to.be.at.least(1);
            });
        });
        it("should authenticate and have a bot ID", function() {
            return slackAPI.getBotID().then(function(name){
                expect(name.length).to.be.at.least(1);
            });
        });
        it("find a user named mikerobertking", function() {
          return slackAPI.getUser('mikerobertking').then(function(user) {
            expect(user).to.exist;
          });
        });
        it("to not find a user named fakemikerobertking", function() {
          return slackAPI.getUser('fakemikerobertking').then(function(user) {
            expect(user).to.not.exist;
          }, function(err) {
            expect(err).to.exist;
          });
        });
        it("to not find ourself in a real users list", function() {
          return Promise.all([slackAPI.getBotID, slackAPI.getRealUsers]).then(function(values) {
            var users = values[1];
            console.log(values[0]());
            expect(values[0]).to.exist;
            expect(values[0]).to.be.at.least(0);
            for (var i = 0; i < users.length; i++) {
              console.log(users[i]);
              expect(users[i]).to.exist;
              expect(users[i].user_id).to.be.at.least(0);
              expect(users[i].user_id).to.not.equal(values[0]);
            }
          }, function() {
          });
        });
    });
});
