var slack = require('slack');
var moment = require('moment');
var ToggleTimeCheck = require('./Toggl.js');
var bot = slack.rtm.client();

// CONST
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_CHANNEL_NAME = process.env.SLACK_CHANNEL_NAME;
var USER_MIN_HOURS = process.env.USER_MIN_HOURS;
var USER_MIN_HOURS_CHECK_FREQUENCY = process.env.USER_MIN_HOURS_CHECK_FREQUENCY;

// do something with the rtm.start payload
bot.started(function(payload) {
    // Schedule Bot To Run User Check Every Day+
    slack.chat.postMessage({token: SLACK_TOKEN, channel: SLACK_CHANNEL_NAME, text: payload}); //TEST, to be removed
    setInterval(RunUserHoursCheck, 300000); // FUTURE CHANGE TO 86400000
});

// start listening to the slack team associated to the token
bot.listen({
    token: SLACK_TOKEN
});

function RunUserHoursCheck() {
    slack.users.list({
        token: SLACK_TOKEN
    }, function(err, data) {
        if (err) {
            console.log(err);
            throw err;
        }

        var members = data.members;
        var now = new moment();
        var weekBefore = new moment().subtract(7, "days");

        for (var i = 0; i < members.length; i++) {
            var member = members[i];

            if (member.is_bot) { // Skip Bots
                continue;
            }

            ToggleTimeCheck.getTimeSpent(weekBefore, now, member.profile.email).then(function(time) {

                if (time < USER_MIN_HOURS) {
                    var text = member.real_name + " has recorded " + time.toPrecision(3) + " work hours for the week, and are behind the minimum hours by " + (USER_MIN_HOURS - time).toPrecision(3) + " hours";
                    slack.chat.postMessage({
                        token: SLACK_TOKEN,
                        channel: SLACK_CHANNEL_NAME,
                        text: text
                    });
                    slack.chat.postMessage({
                        token: SLACK_TOKEN,
                        channel: member.id,
                        text: text
                    });

                }
            }, function(err) {
                console.log(err);
            });
        }
    });

}
