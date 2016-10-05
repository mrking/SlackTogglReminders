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

// do something with the rtm.start payload
bot.started(function(payload) {
    console.log('bot started');

    setInterval(RunUserHoursCheck, 60000);
});

bot.message(function(message) {
  // isn't working
  // if(message.channel != SLACK_CHANNEL_NAME) {
  //  return;
  //}

  if (ValidateMessage(message.text)) {
    var commands = message.text.split(' ');
    if(message.text=='help') {
        slackAPI.postMessageToChannel('f u I don\'t help');
    }

    switch(commands[1]) {
      case 'USER_MIN_HOURS':    //startNotifications [minHours] [checkFrequency]
        if (commands[2] && parseInt(commands[2])) {
          USER_MIN_HOURS = parseInt(commands[2]);
        } else {
          slackAPI.postMessageToChannel('incorrect parameters for USER_MIN_HOURS');
        }
        break;
      case 'USER_MIN_HOURS_CHECK_FREQUENCY':
        if (commands[2] && parseInt(commands[2])) {
          USER_MIN_HOURS_CHECK_FREQUENCY = parseInt(commands[2]);
        } else {
          slackAPI.postMessageToChannel('incorrect parameters for USER_MIN_HOURS_CHECK_FREQUENCY');
        }
        break;
      default:
        break;
    }
  }
});


function ValidateMessage(message) {
  if (message && (message.startsWith("set") || message.startsWith("help")))
    return true;
}

// start listening to the slack team associated to the token
bot.listen({
    token: SLACK_TOKEN
});

function RunUserHoursCheck() {
    slackAPI.getUsers().then(function(response) {

        var members = response.members;
        var now = new moment();
        var weekBefore = new moment().subtract(7, "days");

        for (var i = 0; i < members.length; i++) {
            var member = members[i];
            if (member.is_bot) { // Skip Bots
                continue;
            }

            toggl.getTimeSpent(weekBefore, now, member.profile.email).then(function(time) {

                if (time < USER_MIN_HOURS) {
                    var text = member.real_name + " has recorded " + time.toPrecision(3) + " work hours for the week, and are behind the minimum hours by " + (USER_MIN_HOURS - time).toPrecision(3) + " hours";
                    //slackAPI.sendNotification(SLACK_CHANNEL_NAME, 'MINIMUM_TIME_DEFICIT', text);
                    slackAPI.sendNotification(member.id, 'MINIMUM_TIME_DEFICIT', text);
                }
            }, function(err) {
                console.log(err);
            });
        }
    });

}
