var slack = require('slack');

// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;
var SLACK_NOTIFICATION_LIMIT_PERIOD = process.env.SLACK_NOTIFICATION_LIMIT_PERIOD;
var ADMIN_SLACK_TOKEN = process.env.ADMIN_SLACK_TOKEN;

var UsersInSlack = {};
var _sent_notifications = {};
var _selfAuth = null;

var self = module.exports = {
  logoff: function() {
    _selfAuth = null;
  },
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
  getUser: function(email) {
    if(UsersInSlack[email]) {
      return Promise.resolve(UsersInSlack[email]);
    } else {
      return new Promise(function (resolve, reject) {
        // test ws ID 1382104
        self.getUsers().then(function(users) {
          for (var i = 0; i <  users.length; i++) {
            UsersInSlack[users[i].profile.email] = users[i];
          }

          if(UsersInSlack[email]) {
            resolve(UsersInSlack[email]);
          } else {
            reject('unable to find ' + email +  ' in slack');
          }
        }, function() {
          console.error ('Unable to find slack user %s', email);
          reject('unable to find ' + email +  ' in slack');
        });
      });
    }
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
        var new_users = [];
        for (var i = 0; i < users.length; i++) {
          if(!users[i].is_bot) {
            new_users.push(users[i]);
          }
        }
        resolve(new_users);
      });
    });
  },
  postMessageToChannel: function(message, channel) {
    if(!channel) {
      console.log('no channel set, using default');
      channel = SLACK_CHANNEL_NAME;
    }

    console.info('posting message to channel: %s', message);
    return new Promise(function(resolve, reject) {
      slack.chat.postMessage({
        token: SLACK_TOKEN,
        channel: channel,
        text: message,
        as_user: true
      }, function(err){
        if(err) {
          console.error('unable to post message to channel: ' + err);
          reject(err);
        }
      });
      resolve(true);
    });
  },
  postMessageToUser: function(message, userName) {
    console.info('posting message to user %s: %s', userName, message);
    return self.postMessageToChannel(message, userName);
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
    self.postMessageToUser(message, userName);
    if(alsoSendToChannel) {
      self.postMessageToChannel(message);
    }
  },
  deleteDirectMessages: function(query) { //OPTIONAL ARGS - LIST OF USERS
    slack.search.messages({token: ADMIN_SLACK_TOKEN, query: query}, function(err, data) {

      if(err) {
        console.log('search query is unsuccessful');
        console.log(err);
        return;
      } else {
        console.log(data);
      }

      if(data.messages.total > 0) {
        console.log('message query for ' + query + ' is successful');
        var affixes = ['previous', 'previous_2', 'next', 'next_2'];
        data.messages.matches.forEach(function(message) {
          if(message.type=="im" && query.toLowerCase() == message.text.toLowerCase()) {
            slack.chat.delete({token: SLACK_TOKEN, ts: message.ts, channel: message.channel.id});
          }
          affixes.forEach(function(text) {
            if(message[text] && message[text].text.toLowerCase() == query.toLowerCase())
              slack.chat.delete({token: SLACK_TOKEN, ts: message[text].ts, channel: message.channel.id});
          });
        });
      }
    });
  }
};
