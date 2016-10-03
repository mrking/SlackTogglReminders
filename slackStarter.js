var slack = require('slack');
var moment = require('moment');
var Settings = require('./settings.json');
var ToggleTimeCheck = require('./togglTestFile.js');
console.log(ToggleTimeCheck.getTimeSpent);
var team = Settings.teamname;
var botToken = 'xoxb-86540983813-wvuB3y64w2jR0xGwK5DEfqmE';


  slack.users.list({token: botToken}, function(err, data) {
    if(err) {
      console.log(err);
      throw err;
    }

    var members = data.members;
    var now = new moment();
    var weekBefore = new moment().subtract(7, "days");

    // console.log(data.members);
    for (var i = 0; i < members.length; i++) {
      var member = members[i];
      if (member.is_bot)
        continue;

      console.log(member);
      ToggleTimeCheck.getTimeSpent(weekBefore, now, member.profile.email, function(err, time) {
        if (time < Settings.minHours) {
          var text = "You have recorded " + time + " work hours for the week, and are behind the minimum hours by " + (Settings.minHours - time) + " hours";
          slack.chat.postMessage({token: botToken, channel: Settings.channelID, text: text});
          console.log(text);
        }
      });
    }
  });
//};
