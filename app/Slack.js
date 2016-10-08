var slack = require('slack');
var cache = require('./cache.js');

// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;
var SLACK_NOTIFICATION_LIMIT_PERIOD = process.env.SLACK_NOTIFICATION_LIMIT_PERIOD;

var UsersInSlack = {};
var _sent_notifications = {};
var _selfAuth = null;

var self = module.exports = {
  getBotName: function() {
    if(_selfAuth) {
      return Promise.resolve(_selfAuth.user);
    } else {
      return new Promise(function(resolve, reject) {
        slack.auth.test({token: SLACK_TOKEN}, function(err, data) {
          if (err) {
            reject(err);
            return;
          } else {
            _selfAuth = data;
            resolve(data.user);
            return;
          }
        });
      });
    }
  },
  getUser: function(username) {
    return Promise.resolve(cache(username, 24));
    // if(UsersInSlack[username]) {
    //   return Promise.resolve(UsersInSlack[username]);
    // } else {
    //   return new Promise(function (resolve, reject) {
    //     // test ws ID 1382104
    //     self.getUsers().then(function(users) {
    //       for (var i = 0; i <  users.length; i++) {
    //         UsersInSlack[users[i].email] = users[i];
    //       }
    //
    //       if(UsersInSlack[username]) {
    //         resolve(UsersInSlack[username]);
    //       } else {
    //         reject('unable to find ' + email +  ' in slack');
    //       }
    //     }, function() {
    //       console.error ('Unable to find slack user %s', email);
    //       reject('unable to find ' + email +  ' in slack');
    //     });
    //   });
    // }
  },
  getBotID: function() {
    if(_selfAuth) {
      return Promise.resolve(_selfAuth.user_id);
    } else {
      return new Promise(function(resolve, reject) {
        slack.auth.test({token: SLACK_TOKEN}, function(err, data) {
          if (err) {
            reject(err);
            return;
          } else {
            _selfAuth = data;
            resolve(data.user_id);
            return;
          }
        });
      });
    }
  },
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
  postMessageToChannel: function(message, channel) {
    if(!channel) {
      console.log('no channel set, using default');
      channel = SLACK_CHANNEL_NAME;
    }

    console.info('posting message to channel: %s', message);
    slack.chat.postMessage({
      token: SLACK_TOKEN,
      channel: channel,
      text: message,
      as_user: true
    }, function(err){
      if(err)
      console.error('unable to post message to channel: ' + err);
    });
  },
  postMessageToUser: function(userName, message) {
    console.info('posting message to user %s: %s', userName, message);
    self.postMessageToChannel(message, userName);
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
