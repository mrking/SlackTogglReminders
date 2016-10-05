var moment = require('moment');
var togglAPI = require('./Toggl.js');
var slackAPI = require('./Slack.js');
var slack = require('slack');
var bot = slack.rtm.client();


// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;
var USER_MIN_HOURS = process.env.USER_MIN_HOURS;
var USER_MIN_HOURS_CHECK_FREQUENCY = process.env.USER_MIN_HOURS_CHECK_FREQUENCY;  //in milliseconds
var USER_MIN_HOURS_IN_DAYS = process.env.USER_MIN_HOURS_IN_DAYS;


// do something with the rtm.start payload
bot.started(function(payload) {
    console.log('bot started');
    console.log('setting RunUserHoursCheck on interval %d', USER_MIN_HOURS_CHECK_FREQUENCY);
    slackAPI.getBotName().then(function(name){
      console.log('connected to slack and my name is %s', name);
    });
    setInterval(RunUserHoursCheck, USER_MIN_HOURS_CHECK_FREQUENCY);
});


bot.message(function(message) {
  slackAPI.getBotID().then(function(name){
    if(message.text.indexOf('@' + name) != -1) {
      var message_split = message.text.split(' ');
      switch(message_split[1]) {
        case 'report':
          if(message_split.length > 2) {
            // do some stuff in here
          }
          else {
            slackAPI.postMessageToChannel('To get a time report on a user type "report USER_NAME" (e.g. "report mikerobertking")', message.channel)
          }
          break;
        case 'help':
          slackAPI.postMessageToChannel('*\n* The following commands are available:\n* set (an environment variable)\n* report (on a user)', message.channel);
          break;
        default:
          slackAPI.postMessageToChannel('Unknown Command: say "help" for commands', message.channel);
      }
    }
  });
});

// start listening to the slack team associated to the token
bot.listen({
    token: SLACK_TOKEN
});

function RunUserHoursCheck(username) {
    console.log('Running User Hours Check');
    var startPeriod = new Date();
    startPeriod.setDate(startPeriod.getDate() - USER_MIN_HOURS_IN_DAYS);

    slackAPI.getRealUsers().then(function(members) {
       members.forEach(function(member) {
          togglAPI.getTimeSpent(startPeriod, new Date(), member.profile.email).then(function(time) {
              if (time < USER_MIN_HOURS) {
                  var text = member.real_name + " has recorded " + time.toPrecision(3) + " work hours for the week, and are behind the minimum hours by " + (USER_MIN_HOURS - time).toPrecision(3) + " hours of the total " + USER_MIN_HOURS;
                  slackAPI.sendNotification(member.id, 'USER_MIN_HOURS', text, true);
              }
            }, function(err) {
                console.error(err);
            }
          );
        });
      },
      function(message) {
        console.error('RunUserHoursCheck error');
        console.error(message);
      });
}
