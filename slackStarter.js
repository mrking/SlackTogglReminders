var Slack = require('slack');
var Settings = require('./settings.json');
var ToggleTimeCheck = require('TogglTimeCheck');
var team = Settings.teamname;
var botToken = Settings.botToken;


var weeklyToggl = function() {
  slack.users.list({token: botToken}, function(err, data) {
    var members = data.members;
    for (var i = 0; i < members.length; i++) {
      var member = members[i];
      var now = new Date();
      ToggleTimeCheck.getTimeSpent(now.getDate() - 7, now, member.profile.email, function(err, time) {
        if (time < Settings.minHours) {
          var text = "You have recorded " + time + " work hours for the week, and are behind the minimum hours by " + Settings.minHours - time + " hours";
          slack.chat.postMessage({token: botToken, channel: Settings.channelID, text: text});
        }
      });
    }
  });
};
