var expect = require("chai").expect;
var assert = require('chai').assert;
process.env.SLACK_TOGGLE_BOT_TEST = true; // PREVENT BOT FROM STARTING UP
var bot = require("../app/Bot.js");
var slackAPI = require('../app/Slack.js');


describe("Our bot", function() {
    this.timeout(15000);

    // TODO Test needs to be written actually sending messages to a channel
    // and parsing to check for slack markup changes
    // but read messages is not finished yet in slackAPI
    it("knows when it is being addressed", function() {
      return Promise.all([slackAPI.getBotID(), slackAPI.getBotName()]).then(function(values) {
        return bot.isMessageAddressedToMe('hello')
        .then(function(flag) {
          expect(flag).to.be.false;
          return bot.isMessageAddressedToMe('@%' + values[0] + '% hello');
        })
        .then(function(flag) {
          expect(flag).to.be.true;
          return bot.isMessageAddressedToMe('@' + values[1] + ' hello');
        })
        .then(function(flag) {
          expect(flag).to.be.true;
          return bot.isMessageAddressedToMe('hello @' + values[1] + '');
        })
        .then(function(flag) {
          expect(flag).to.be.true;
        });
      });
    });
});
