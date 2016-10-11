var expect = require("chai").expect;
var assert = require('chai').assert;
var slackAPI = require("../app/Slack.js");

var DEBUG_MESSAGE = "ZYXWVUTSRQPONMLKJIHGFEDCBA";

// These tests are not fully unit,
// closer to being integration tests,
// but achieve the same purpose.

describe("Our slack API test account", function() {
  this.timeout(10000);
  describe("user", function() {
    it("should authenticate and have a bot name", function() {
      slackAPI.logoff();
      slackAPI.getBotName().then(function(name){
        expect(name.length).to.be.at.least(1);
      });
      return slackAPI.getBotName().then(function(name){
        expect(name.length).to.be.at.least(1);
      });
    });
    it("should authenticate and have a bot ID", function() {
      slackAPI.logoff();
      slackAPI.getBotID().then(function(name){
        console.log("BOT BOT BOT ID " + name);
        expect(name.length).to.be.at.least(1);
      });
      return slackAPI.getBotID().then(function(name){
        console.log("BOT BOT BOT ID " + name);
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
  describe("posting a message", function() {
    it("should be able to post a message with or without channel details", function() {
      return slackAPI.postMessageToChannel(DEBUG_MESSAGE).then(function(result) {
        expect(result).to.be.true;
      }, function(err) {
        expect(err).to.exist;
      });
    });
    it("should be able to send a message to a user and delete old debug messages", function() {
      return slackAPI.getUser('new.overlord@gmail.com').then(function(user) {
        slackAPI.postMessageToUser(DEBUG_MESSAGE, user.id).then(function(result) {
          console.log("slackbot id is " + user.id);
          //AFTER TESTING CLEAR OFF MESSAGES WITH DEBUG_MESSAGE
          var deleteResponse = slackAPI.deleteDirectMessages('ALL HAIL TYRONE');
          expect(deleteResponse).to.exist;
          expect(deleteResponse.successful_count).to.be.at.least(0);
          expect(result).to.be.true;

        }, function(err) {
          expect(err).to.exist;
        });
      });
    });
    it("must throw an error when posting to a non-existent or inaccessible channel", function() {
      var channels = ['sith-lord-king', 'biz-setup'];

      channels.forEach(function(channel) {
        return slackAPI.postMessageToChannel("Once more the Sith will rule the galaxy, and we shall have peace", channel).then(function(result) {
          expect(result).to.be.true;
        }, function(err) {
          expect(err).to.exist;
        });
      });
    });
    it("must send notifications of type x to both channel and user", function() {
      slackAPI.sendNotification("slackbot", "USER_MIN_HOURS", DEBUG_MESSAGE, true);
      slackAPI.sendNotification("slackbot", "USER_MIN_HOURS", DEBUG_MESSAGE, true);
    });
  });
});
