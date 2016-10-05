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
    setInterval(RunUserHoursCheck, USER_MIN_HOURS_CHECK_FREQUENCY);
});


bot.message(function(message) {

  if (ValidateMessage(message.text)) {
    var commands = message.text.split(' ');

    switch(commands[0]) {
      case 'startNotifications':    //startNotifications [minHours] [checkFrequency]
        if (commands[1] && parseInt(commands[1])) {
          USER_MIN_HOURS = parseInt(commands[1]);
        }   //since the [minHours] parameter is an optional field, allow them to ignore the parameter or write the wrogn flags
        if (commands[2] && parseInt(commands[2])) {
            USER_MIN_HOURS_CHECK_FREQUENCY = parseInt(commands[2]);
        } //since the [minHours] parameter is an optional field, allow them to ignore the parameter or write the wrogn flags
        slackAPI.postMessageToChannel('Notifications started');
        setInterval(RunUserHoursCheck, USER_MIN_HOURS_CHECK_FREQUENCY);
        break;
      case 'help':
        slackAPI.postMessageToChannel('f u I don\'t help');
        break;
      default:
        break;
    }
  }
});

function ValidateMessage(message) {
  if (message && (message.startsWith("startNotifications") || message.startsWith("help")))
    return true;
}

// start listening to the slack team associated to the token
bot.listen({
    token: SLACK_TOKEN
});

function RunUserHoursCheck() {
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
