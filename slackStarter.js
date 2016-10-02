var Settings = require('./settings.json');
var ToggleTimeCheck = require('TogglTimeCheck');
var team = Settings.teamname;
var botToken = Settings.botToken;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


var getTeamList = function() {
  var url = "https://" + team + ".slack.com/api/users.list?token=" + botToken;
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var jsonResponse = JSON.parse(xhr.responseText);
      var members = jsonResponse.members;
      for (var i = 0; i < members.length; i++) {
        var member = members[i];
        var now = new Date();
        ToggleTimeCheck.getTimeSpent(now.getDate() - 7, now, member.profile.email, function(err, time) {
          if (time < Settings.minHours) {
            var dm = new XMLHttpRequest();

            var dmUrl = "https://" + team + ".slack.com/api/chat.postMessage?token=" + botToken + "&channel=" + settings.channelID + "&text=";
            dm.onreadystatechange = function() {
              if (dm.readyState == 4 && dm.status == 200) {
              }
            };
            dm.open("GET", dmUrl, true;)
          }
        });
      }
    }
    xhr.open("GET", url, true);
    xhr.send();
  };
};
