var TogglClient = require('toggl-api');
var Settings = require('./settings.json');

var toggl = new TogglClient({apiToken: Settings.toggleAPItoken});

module.exports = {
  // very inefficient dirty function for getting hours
  // returns hours
  getTimeSpent: function (start, end, email, callback) {
    toggl.getWorkspaces(function(err, workspaces) {

      // dirty throw for now
      if(err) {
        throw err;
      }

      // get workspace names
      for (var i = 0; i < workspaces.length; i++) {
        //console.log(workspaces);
        if(Settings.toggleWorkspaceName.indexOf(workspaces[i].name) > -1) {
            console.log('found the workspace');
            // get workspace users
            toggl.getWorkspaceUsers(workspaces[i].id, function(err, users) {
              //console.log(users);
              var foundUser = false;
              for (var i = 0; i < users.length; i++) {
                if(users[i].email == email) {
                  console.log(start.toISOString().slice(0,10));
                  console.log(end.toISOString().slice(0,10));

                  toggl.summaryReport({"grouping": "users", "workspace_id": users[i].default_wid, "user_ids": users[i].id, "since": start.toISOString().slice(0,10), "until": end.toISOString().slice(0,10)}, function(err, report) {
                    if(err) {
                      console.log('stupid error');
                      console.log(err);
                    }
                    callback(undefined, report.total_grand / 3600000);
                  });
                  foundUser = true;
                  break;
                }
              }
              if(!foundUser) {
                callback("Unable to find user");
              }
            });
        }
      }
    });
  }
};

// example calls
/*getTimeSpent('2016-07-01', '2016-12-01', 'mikerobertking@gmail.com', function(err, time) {
  console.log("got Mike's hours: " + time);
});
getTimeSpent('2016-07-01', '2016-12-01', 'new.overlord@gmail.com', function(err, time) {
  console.log("got Tyrone's hours: " + time);
});
*/
