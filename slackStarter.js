var moment = require('moment');
var toggl = require('./Toggl.js');
var slackAPI = require('./Slack.js');
var slack = require('slack');
var bot = slack.rtm.client();


// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;
var USER_MIN_HOURS = process.env.USER_MIN_HOURS;
var USER_MIN_HOURS_CHECK_FREQUENCY = process.env.USER_MIN_HOURS_CHECK_FREQUENCY;  //in milliseconds


controller.hears(['help'], ['direct_message', 'direct_mention'], function (bota, evt) {
  var help = 'I am an efficient little bot. All you need is a single instance of me to handle ' +
      'multiple teams. If you run me on BeepBoop, I will even auto-scale! :boom:';
  console.log("FAZBOT");
  console.log(bota);
  bota.reply(evt, help);
  // slackAPI.postMessageToChannel
});

// do something with the rtm.start payload
bot.started(function(payload) {
    console.log('bot started');
    RunUserHoursCheck();
    setInterval(RunUserHoursCheck, USER_MIN_HOURS_CHECK_FREQUENCY);
});


bot.message(function(message) {
  slackAPI.postMessageToChannel('Hello from the other side, I must have called a thousand times');
  slackAPI.postMessageToUser('@tyronetan', message.text); //this works
  // isn't working
  // if(message.channel != SLACK_CHANNEL_NAME) {
  //  return;
  //}

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

    slackAPI.getUsers().then(function(members) {
      //  console.log(response);
        var now = new moment();
        var weekBefore = new moment().subtract(7, "days");
        for (var i = 0; i < members.length; i++) {
            var member = members[i];

            if (member.is_bot) { // Skip Bots
                continue;
            }
            console.log('making time request');

            toggl.getTimeSpent(weekBefore, now, member.profile.email).then(function(time) {
                console.log(time);
                if (time < USER_MIN_HOURS) {
                    var text = member.real_name + " has recorded " + time.toPrecision(3) + " work hours for the week, and are behind the minimum hours by " + (USER_MIN_HOURS - time).toPrecision(3) + " hours";
                    slackAPI.sendNotification(member.id, 'USER_MIN_HOURS', text, true);
                }
            }, function(err) {
                console.log(err);
            });
        }
    }, function(message) {
      console.error('RunUserHoursCheck error');
      console.error(message);
    });
}

function RunWeeklyReportsCheck() {

}
