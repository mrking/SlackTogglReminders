var slack = require('slack');
var Settings = require('./settings.json');
var ToggleTimeCheck = require('./togglTestFile.js');
console.log(ToggleTimeCheck.getTimeSpent);
var team = Settings.teamname;
var botToken = 'xoxp-26250155218-26230467748-86427991783-e79f6b5172f1a30998ad850b67ef81d4';

//var weeklyToggl = function() {
  slack.users.list({token: botToken}, function(err, data) {
    if(err)
      throw err;

    var members = data.members;
  //  console.log(data.members);
    for (var i = 0; i < members.length; i++) {
      var member = members[i];
      var now = new Date();
      ToggleTimeCheck.getTimeSpent(now, now, member.profile.email, function(err, time) {
        if (time < Settings.minHours) {
          var text = "You have recorded " + time + " work hours for the week, and are behind the minimum hours by " + (Settings.minHours - time) + " hours";
          console.log(text);
          slack.chat.postMessage({token: botToken, channel: Settings.channelID, text: text});
        }
      });
    }
  });
//};
