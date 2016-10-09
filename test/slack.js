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
        it("find a user email mikerobertking@gmail.com", function() {
          return slackAPI.getUser('mikerobertking@gmail.com').then(function(user) {
            expect(user).to.exist;
          });
        });
        it("to not find a user email fakemikerobertking@gmail.com", function() {
          return slackAPI.getUser('fakemikerobertking@gmail.com').then(function(user) {
            expect(user).to.not.exist;
          }, function(err) {
            expect(err).to.exist;
          });
        });
        it("to not find ourself in a real users list", function() {
          return Promise.all([slackAPI.getBotID(), slackAPI.getRealUsers()]).then(values => {
            var users = values[1];
            expect(values[0]).to.exist;
            for (var i = 0; i < users.length; i++) {
              expect(users[i]).to.exist;
              expect(users[i].id).to.exist;
              expect(users[i].id).to.not.equal(values[0]);
            }
          }, function() {
          });
        });
    });
});
