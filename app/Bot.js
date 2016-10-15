var togglAPI = require('./Toggl.js');
var slackAPI = require('./Slack.js');
var TimeReport = require('./TimeReport.js');
var slack = require('slack');
var bot = require('botkit');


// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;
var USER_MIN_HOURS_CHECK_FREQUENCY = process.env.USER_MIN_HOURS_CHECK_FREQUENCY;  //in milliseconds


var controller = bot.slackbot({
  debug: false
});

// Do not start up the bot if we are running unit testing only
if(!process.env.SLACK_TOGGLE_BOT_TEST) {
  controller.spawn({
    token: SLACK_TOKEN,
  }).startRTM();

  // Setup Routines
  setInterval(RunUserHoursCheck, USER_MIN_HOURS_CHECK_FREQUENCY);
}

var help = "You may use the following commands: \n" +
           "report [Email-Address]\n";

controller.hears(['hello', 'help'],['direct_message','direct_mention','mention'],
  function(bot,message) {
    bot.reply(message, help);
  }
);

// comes in as <mailto:email|email>
controller.hears(['report <mailto:(.*)'],['direct_message','direct_mention','mention'],
  function(bot,message) {
    console.log('Looking up hours for %s', message.match[1].substring(0,  message.match[1].indexOf('|')));
    GetTimeReportForUser( message.match[1].substring(0,  message.match[1].indexOf('|'))).then(function(result) {
      bot.reply(message, result.toString());
    }).catch(function(err) {
      bot.reply(message, "Unable to get hours for " + message.match[1].substring(0,  message.match[1].indexOf('|')));
    });
  }
);

function RunUserHoursCheck(user) {
      slackAPI.getRealUsers().then(function(members) {
         members.forEach(function(member) {
              TimeReport.GetTimeReport(member.profile.email).then(function(timeReport) {
                console.log(timeReport.meetExpectedHours());
                if(!timeReport.meetExpectedHours()) {
                  slackAPI.sendNotification(member.id, 'USER_MIN_HOURS', timeReport.toString(), true);
                }
              }, function(err) {
                  slackAPI.postMessageToChannel('Unable to find hours for ' + member.real_name);
              });
            });
          });
}
