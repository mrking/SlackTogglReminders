var slack = require('slack');
var bot = slack.rtm.client();
var token = process.env.SLACK_TOKEN;
var Settings = require('./settings.json');

// logs: ws, started, close, listen, etc... in addition to the RTM event handler methods
console.log(Object.keys(bot));

// do something with the rtm.start payload
bot.started(function(payload) {
  slack.chat.postMessage({token: token, channel: Settings.channelID, text: 'Did I Start?'});
  console.log('payload from rtm.start', payload);
});

// respond to a user_typing message
bot.user_typing(function(msg) {
  console.log('several people are coding', msg);
});

// start listening to the slack team associated to the token
bot.listen({token:token});

/*
var moment = require('moment');
var ToggleTimeCheck = require('./togglTestFile.js');
var team = Settings.teamname;


  slack.users.list({token: token}, function(err, data) {
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

      //console.log(member);
      ToggleTimeCheck.getTimeSpent(weekBefore, now, member.profile.email, function(err, time) {
        if (time < Settings.minHours) {
          var text = "You have recorded " + time + " work hours for the week, and are behind the minimum hours by " + (Settings.minHours - time) + " hours";
          //console.log('before post a message');
          slack.chat.postMessage({token: token, channel: Settings.channelID, text: text});
          //console.log(text);
        }
      });
    }
  });
//};*/
