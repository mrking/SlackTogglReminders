var slack = require('slack');

// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;

var self = module.exports = {
  getUsers: function() {
    return new Promise(function(resolve, reject) {
      slack.users.list({token: SLACK_TOKEN}, function(err, data) {
        if (err) {
            reject(err);
            return;
        } else {
          return data.members;
        }
      });
    });
  },
  postMessageToChannel: function(message) {
    slack.chat.postMessage({
        token: SLACK_TOKEN,
        channel: SLACK_CHANNEL_NAME,
        text: text
    });
  },
  postMessageToUser: function(userName, message) {
    slack.chat.postMessage({
        token: SLACK_TOKEN,
        channel: userName,
        text: text,
        as_user: false
    });
  }
};
