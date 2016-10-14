# SlackTogglReminders

[![Build Status](https://travis-ci.org/mrking/SlackTogglReminders.svg?branch=master)](https://travis-ci.org/mrking/SlackTogglReminders) [![Coverage Status](https://coveralls.io/repos/github/mrking/SlackTogglReminders/badge.svg?branch=master)](https://coveralls.io/github/mrking/SlackTogglReminders?branch=master)

This is a simple bot for slack that runs on [Beep Boop HQ](http://beepboophq.com) (Slack's bot hosting platform) integrating with [Toggl](http://toggl.com) to run some simple reporting and monitoring tasks:

  - Reminds user that they have failed to meet the minumum hours in a period. 
  - Provide a rolling period summary for any user in slack connected to toggl

### Required Environment Variables

You will need the following environment variables for this bot to run.

```sh
SLACK_TOKEN= 
SLACK_CHANNEL_NAME=  
SLACK_NOTIFICATION_LIMIT_PERIOD= 
TOGGL_API_TOKEN=
TOGGL_WORKSPACE_NAME= 
USER_MIN_HOURS= 
USER_MIN_HOURS_IN_DAYS= 
USER_MIN_HOURS_CHECK_FREQUENCY= 
```

`SLACK_TOKEN`
Slack API Token Provided Here: https://[YOUR_SLACK_TEAM].slack.com/apps/new/

`SLACK_CHANNEL_NAME`
Default slack channel for which the bot will post notifications (e.g. time-management) 

`SLACK_NOTIFICATION_LIMIT_PERIOD`
How often the bot can send a notification for a particular user in hours (e.g. 24)

`TOGGL_API_TOKEN`
Toggl API Token Provided Here: https://www.toggl.com/app/profile

`TOGGL_WORKSPACE_NAME`
Toggl Workspace Name to use (e.g. SlackTogglRemindersWorkspace)

`USER_MIN_HOURS`
Minimum number hours needed to be recorded in a period (e.g. 40)

`USER_MIN_HOURS_IN_DAYS`
Number of days in the rolling period (e.g. 7)

`USER_MIN_HOURS_CHECK_FREQUENCY`
How often to check toggl for time tracking in miliseconds (e.g. 60000)
