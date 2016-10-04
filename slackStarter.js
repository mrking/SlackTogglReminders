var slack = require('slack');
var moment = require('moment');
var ToggleTimeCheck = require('./togglTestFile.js');
var Settings = require('./settings.json');
//var dotenv = require('dotenv');
//dotenv.load();
var bot = slack.rtm.client();
var token = process.env.SLACK_TOKEN;
var slackchannel = process.env.SLACK_CHANNEL_ID;

// do something with the rtm.start payload
bot.started(function(payload) {
  //schedule the toggl notifications at bot init?
  setInterval(function() {
    //if (moment().diff(moment().endOf('week')) <= 3600000) { //if time now is less than one hour to the end of the week, run code
      console.log(new moment());

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
          ToggleTimeCheck.getTimeSpent(weekBefore, now, member.profile.email).then(function(time) {
            console.log(member);
            if (time < Settings.minHours) {
              var text =  member.real_name + " has recorded " + time.toPrecision(3) + " work hours for the week, and are behind the minimum hours by " + (Settings.minHours - time).toPrecision(3) + " hours";
              //console.log('before post a message');
              slack.chat.postMessage({token: token, channel: slackchannel, text: text});
              //console.log(text);
            }
          }, function(err) { console.log(err); });
        }
      });
    //}
  }, 600000); // 86400000 run once a day but for testing run every 60 seconds.
});

// start listening to the slack team associated to the token
bot.listen({token:token});
/*
var Settings = require('./settings.json');
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
