var slack = require('slack');

// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;
var SLACK_NOTIFICATION_LIMIT_PERIOD = process.env.SLACK_NOTIFICATION_LIMIT_PERIOD;
var ADMIN_SLACK_TOKEN = process.env.ADMIN_SLACK_TOKEN;

var UsersInSlack = {};
var _sent_notifications = {};
var _selfAuth = null;

function SlackResponse(result, err) {
  this.result = result;
  this.error = err;
}

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
  getChannels: function() {
    return new Promise(function(resolve, reject) {
      slack.channels.list({token: SLACK_TOKEN}, function(err, data) {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(data.channels);
          return;
        }
      });
    });
  },
  getChannelID: function(channel_name) {
    return self.getChannels().then(function(channels) {
        for(var i = 0; i < channels.length; i++) {
          if(channels[i].name == channel_name){
            console.log('found channel id' + channels[i].id);
            return channels[i].id;
          }
        }
        return -1;
    });
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

    console.info('posting message to %s: %s',channel, message);
    return new Promise(function(resolve, reject) {
      slack.chat.postMessage({
        token: SLACK_TOKEN,
        channel: channel,
        text: message,
        as_user: true
      }, function(err){
        var response = new SlackResponse((err), err);
        if(err) {
          console.error('unable to post message to channel %s : %s ', channel, err);
          reject(err);
          return;
        } else {
          resolve(channel);
          return;
        }
      });
    });
  },
  postMessageToUser: function(message, userName) {
    //console.info('posting message to user %s: %s', userName, message);
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
  // searchMessages: function(query, channel) {
  //   return slack.search.messages({token: ADMIN_SLACK_TOKEN, query: query}, function(err, data) {
  //     if(err || data.messages.total === 0) {
  //       console.log('search query is unsuccessful');
  //       reject(err);
  //     }
  //
  //
  //     this.match_count = 0;
  //     var affixes = ['previous', 'previous_2', 'next', 'next_2'];
  //
  //     if (channel) {
  //       data.messages.matches.forEach(function(message) {
  //         if(message.channel.name == channel) {
  //           if(message.text.toLowerCase() == query.toLowerCase())
  //             match_count++;
  //
  //           affixes.forEach(function(text) {
  //             if(message[text].text.toLowerCase() == query.toLowerCase())
  //               match_count++;
  //           });
  //         }
  //       });
  //       resolve(match_count);
  //     } else {
  //       console.log('----------------------------');
  //       data.messages.matches.forEach(function(message) {
  //         if(message.text.toLowerCase() == query.toLowerCase())
  //           this.match_count++;
  //
  //         affixes.forEach(function(text) {
  //           if(message[text].text.toLowerCase() == query.toLowerCase())
  //           this.match_count++;
  //         });
  //       });
  //       resolve(match_count);
  //     }
  //   });
  // },
  deleteMessages: function(query, type) {
    var matchUsers = Array.prototype.slice.call(arguments, 3);
    var userMatchSearch = (matchUsers && matchUsers.length > 0);

    console.log("matchUsers: ");
    console.log(matchUsers);
    slack.search.messages({token: ADMIN_SLACK_TOKEN, query: query}, function(err, data) {
      if(err) {
        console.log('search query is unsuccessful');
        return err;
      }

      if(data.messages.total > 0) {
        console.log('message query for ' + query + ' is successful');
        var affixes = ['previous', 'previous_2', 'text', 'next', 'next_2'];
        var result = {
          successful_count: 0,
          fail_count: 0,
          ok: false
        };
        data.messages.matches.forEach(function(message) {
          //code below loops through the messages chained to the parent timestamp and deletes them if they match the query
          affixes.forEach(function(text) {    //TODO FIX THIS NESTED IF STRUCTURE!!!!!
            if(message[text] && message.type==type) {
              if (text == "text" && message.text.toLowerCase() == query.toLowerCase()) {
                if (userMatchSearch && matchUsers.includes(message.username)) {
                  slack.chat.delete({token: SLACK_TOKEN, ts: message.ts, channel: message.channel.id}, function(err, data) {
                    if (err)
                    result.fail_count++;
                    else
                    result.successful_count++;
                  });
                } else {
                  slack.chat.delete({token: SLACK_TOKEN, ts: message.ts, channel: message.channel.id}, function(err, data) {
                    if (err)
                    result.fail_count++;
                    else
                    result.successful_count++;
                  });
                }
              } else if (message[text].text.toLowerCase() == query.toLowerCase()){

                if (userMatchSearch && matchUsers.includes(message[text].username)) {
                  slack.chat.delete({token: SLACK_TOKEN, ts: message[text].ts, channel: message.channel.id}, function(err, data) {
                    if (err)
                    result.fail_count++;
                    else
                    result.successful_count++;
                  });
                } else {
                  slack.chat.delete({token: SLACK_TOKEN, ts: message[text].ts, channel: message.channel.id}, function(err, data) {
                    if (err)
                    result.fail_count++;
                    else
                    result.successful_count++;
                  });
                }
              }
            }
          });
        });
        result.ok = result.successful_count > 0;
        return result;
      }
    });
  },
  deleteChannelMessages: function(channel, query) { //SHOULD HAVE OPTIONAL ARGS - LIST OF USERS
    var deleteEverything = !(query);

    return self.getChannelID(channel).then(function(channel_id) {

      console.log("channel _" + channel + " ID is " + channel_id);
      console.log(channel_id);

      return new Promise(function(resolve, reject) {
        slack.channels.history({token: SLACK_TOKEN, channel: channel_id, count: 10000}, function(err, data) {
          var result = true;
          data.messages.forEach(function(message) {
            if (deleteEverything) {
              slack.chat.delete({token: SLACK_TOKEN, ts: message.ts, channel: channel_id}, function(err) {
                if (err)
                result = false;
              });
            } else if (query.toLowerCase() == message.text.toLowerCase()) {
              slack.chat.delete({token: SLACK_TOKEN, ts: message.ts, channel: channel_id}, function(err) {
                if (err)
                result = false;
              });
            }
          });
        });
      });
    });
  },
  deleteDirectMessages: function(query) {
    return this.deleteMessages(query, "im", arguments);
  }
};
