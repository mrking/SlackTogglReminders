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
          resolve(data.members);
          return;
        }
      });
    });
  },
  getRealUsers: function() {
    return new Promise(function(resolve, reject) {
      self.getUsers().then(function(users) {
        for (var i = 0; i < users.length; i++) {
          if(users[i].is_bot) {
            users.splice(i, 1);
          }
        }
        resolve(users);
      });
    });
  },
  postMessageToChannel: function(message) {
    console.info('posting message to channel: %s', message);
    slack.chat.postMessage({
        token: SLACK_TOKEN,
        channel: SLACK_CHANNEL_NAME,
        text: message,
        as_user: true
    }, function(err){
      if(err)
      console.error('unable to post message to channel: ' + err);
    });
  },
  postMessageToUser: function(userName, message) {
    console.info('posting message to user %s: %s', userName, message);
    slack.chat.postMessage({
        token: SLACK_TOKEN,
        channel: userName,
        text: message,
        as_user: true
    }, function(err){
      if(err)
      console.error('unable to post message to user: ' + err);
    });
  },
  sendNotification: function(userName, notificationType, message, alsoSendToChannel) {

    if(!_sent_notifications[userName]) {
      _sent_notifications[userName] = {};
    }
    else if(_sent_notifications[userName][notificationType]) {
      if(new Date() - Math.abs(_sent_notifications[userName][notificationType]) > SLACK_NOTIFICATION_LIMIT_PERIOD) {
        console.info('User %s already recieved notification type %s in last %f', userName, notificationType, SLACK_NOTIFICATION_LIMIT_PERIOD);
        return;
      }
    }
    _sent_notifications[userName][notificationType] = new Date();
    self.postMessageToUser(userName, message);
    if(alsoSendToChannel) {
      self.postMessageToChannel(message);
    }
  }
};
