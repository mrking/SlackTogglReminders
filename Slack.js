var slack = require('slack');

// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;
var SLACK_NOTIFICATION_LIMIT_PERIOD = process.env.SLACK_NOTIFICATION_LIMIT_PERIOD;

var _sent_notifications = {};

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
        text: message,
        as_user: true
    });
  },
  postMessageToUser: function(userName, message) {
    slack.chat.postMessage({
        token: SLACK_TOKEN,
        channel: userName,
        text: message,
        as_user: true
    });
  },
  sendNotification: function(userName, notificationType, message, alsoSendToChannel) {
    if(!_sent_notifications[userName]) {
      _sent_notifications[userName] = {};
    }
    else if(_sent_notifications[userName][notificationType]) {
      if(Math.abs(_sent_notifications[userName][notificationType] - new Date()) < SLACK_NOTIFICATION_LIMIT_PERIOD) {
        console.info('User %s already recieved notification type %s in last %i', userName, notificationType, SLACK_NOTIFICATION_LIMIT_PERIOD);
        return;
      }
    }
    _sent_notifications[userName][notificationType] = new Date();
    self.postMessageToUser(userName, message);
    self.postMessageToChannel(message);
  }
};
