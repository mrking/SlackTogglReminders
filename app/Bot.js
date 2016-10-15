var togglAPI = require('./Toggl.js');
var slackAPI = require('./Slack.js');
var slack = require('slack');
var bot = require('botkit');


// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;
var USER_MIN_HOURS = process.env.USER_MIN_HOURS;
var USER_MIN_HOURS_CHECK_FREQUENCY = process.env.USER_MIN_HOURS_CHECK_FREQUENCY;  //in milliseconds
var USER_MIN_HOURS_IN_DAYS = process.env.USER_MIN_HOURS_IN_DAYS;


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

function GetTimeReportForUser(email) {
  var startPeriod = new Date();
  startPeriod.setDate(startPeriod.getDate() - USER_MIN_HOURS_IN_DAYS);

  return Promise.all([togglAPI.getTimeSpent(startPeriod, new Date(), email), slackAPI.getUser(email)])
  .then(function(values) {
      var time = values[0];
      var user = values[1];
      return new TimeReport(user, time, startPeriod, new Date());
  });
}

function TimeReport(user, time, start, end) {
  this._user = user;
  this._hoursRecorded = time;
}

TimeReport.prototype = {
  getUser: function() {
    return this._user;
  },
  getHoursRecorded: function() {
    return this._hoursRecorded;
  },
  meetExpectedHours: function() {
    return this.getHoursRecorded() >= USER_MIN_HOURS;
  },
  toString: function() {
    if(this.meetExpectedHours()) {
      return this.getUser().name + " has recorded " + this.getHoursRecorded().toPrecision(3) + " work hours for the week";
    } else {
      return this.getUser().name + " has recorded " + this.getHoursRecorded().toPrecision(3) + " work hours for the week, and are behind the minimum hours by " + (USER_MIN_HOURS - this.getHoursRecorded()).toPrecision(3) + " hours of the total " + USER_MIN_HOURS;
    }
  }
};

function RunUserHoursCheck(user) {
      slackAPI.getRealUsers().then(function(members) {
         members.forEach(function(member) {
              GetTimeReportForUser(member.profile.email).then(function(timeReport) {
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
