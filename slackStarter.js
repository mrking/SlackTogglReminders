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
    //slackAPI.postMessageToChannel('YO! I AM THE TOGGL BOT FUNCTION STARTED'); //TEST, to be removed
    //slackAPI.postMessageToUser('@mikerobertking', 'test'); this works
    setInterval(function(){},100000); // keep alive
});

slack.message(function(m) {
  console.log('message');
  console.log(m);
});

bot.hello(function(message) {
  console.log('hello message');
  console.log(message);

  /*
  slackAPI.postMessageToChannel('YO! I AM THE TOGGL BOT HELLO FROM THE OTHER SIDE'); //TEST, to be removed
  if (ValidateMessage(message)) {
    var commands = message.split();

    switch(commands[0]) {
      case 'startNotifications':    //startNotifications [minHours] [checkFrequency]
        if (commands[1] && parseInt(commands[1]))
          USER_MIN_HOURS = parseInt(commands[1]);
        if (commands[2] && parseInt(commands[2]) >= 60000) {
          USER_MIN_HOURS_CHECK_FREQUENCY = parseInt(commands[2]);
        }
        setInterval(RunUserHoursCheck, USER_MIN_HOURS_CHECK_FREQUENCY); // FUTURE CHANGE TO 86400000
        break;
      case 'help':
        break;
    }
    slackAPI.postMessageToUser('@mikerobertking', 'NOTIFICATIONS STARTED');
    slackAPI.postMessageToUser('@tyronetan', 'NOTIFICATIONS STARTED');
  }
});


function ValidateMessage(message) {
  console.log(message);
  if (message && (message.startsWith("startNotifications") || message.startsWith("help")))
    return true;*/
});

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
                    slackAPI.postMessageToChannel(SLACK_CHANNEL_NAME, text);
                    slackAPI.postMessageToChannel(member.id, text);
                }
            }, function(err) {
                console.log(err);
            });
        }
    });

}
