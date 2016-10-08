var slack = require('slack');

var storage = {};
// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;

var get = function(user) {
  if (storage[user]) {
    if (!storage[user].valid_until || storage[user].valid_until > Date.now()) //if key has no expiry or is within expiry date
      return storage[user];
    else
      delete storage[user];
  }
};

var set = function(user, expire_in_hours) {
  var key = user.user_id;

  storage[key] = {};
  if (!storage[key])
    storage[key] = {};

  if (expire_in_hours)
    storage[key].valid_until = (Date.now() + expire_in_hours * 3600000);
};

module.exports = function(username, expire_in_hours) {    //Date
  var cache = function() {
    var user = get(username);

    if (!user) {
      user = slack.users.info({token: SLACK_TOKEN, user_id: username});
      set(user, expire_in_hours);
    }

    return user;
  };

  return cache;
};
