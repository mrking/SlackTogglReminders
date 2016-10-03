var TogglClient = require('toggl-api');
var Settings = require('./settings.json');

var toggl = new TogglClient({apiToken: Settings.toggleAPItoken});

var UsersInToggl = {};
var WorkspaceID = -1;


var self = module.exports = {
  // returns a promise for the user object with a parameter of an email address string
  getUser: function(email) {
      if(UsersInToggl[email]) {
        console.log('used user cache');
        return Promise.resolve(UsersInToggl[email]);
      } else {
        return new Promise(function (resolve, reject) {
            // test ws ID 1382104
            self.getWorkspaceID(Settings.toggleWorkspaceName).then(function(wsID) {
              console.log(wsID);
              console.log('wtf');
              toggl.getWorkspaceUsers(wsID, function(err, users) {
                if(err) {
                  reject (err);
                }

                for (var i = 0; i <  users.length; i++) {
                  UsersInToggl[users[i].email] = users[i];
                }

                if(UsersInToggl[email]) {
                  resolve(UsersInToggl[email]);
                } else {
                  reject('unable to find ' + email +  ' in toggl');
                }
              }, function() { console.error ('Unable to find workspace ID for ' + Settings.toggleWorkspaceName); });
            });
        });
      }
    },
    // returns a promise for the configured workspace ID in the config file.
    getWorkspaceID: function(workspaceName) {
      if(WorkspaceID != -1) {
          console.log('used workspace cache');
          return Promise.resolve(WorkspaceID);
      } else {
        return new Promise(function (resolve, reject) {
          toggl.getWorkspaces(function(err, workspaces) {
            for (var i = 0; i < workspaces.length; i++) {

              if(workspaceName == workspaces[i].name) {
                WorkspaceID = workspaces[i].id;
                resolve(WorkspaceID);
                return;
               }
               reject('Unable to find workspace ' + err);
             }
           });
        });
      }
    },
    // a promise to return a users time.
    getTimeSpent: function (start, end, email) {
      return new Promise(function(resolve, reject) {
        var user = self.getUser(email);
        toggl.summaryReport({"grouping": "users", "workspace_id": user.default_wid, "user_ids": users.id, "since": start.toISOString().slice(0,10), "until": end.toISOString().slice(0,10)}, function(err, report) {
          if(err) {
            reject(err);
          }

          resolve(report.total_grand / 3600000);
       });
     });
   }
 };




module.exports.getUser('mikerobertking@gmail.com').then(function(response) {
  console.log("Success!", response);
}, function(error) {
  console.error("Failed!", error);
});


// example calls
/*getTimeSpent('2016-07-01', '2016-12-01', 'mikerobertking@gmail.com', function(err, time) {
  console.log("got Mike's hours: " + time);
});
getTimeSpent('2016-07-01', '2016-12-01', 'new.overlord@gmail.com', function(err, time) {
  console.log("got Tyrone's hours: " + time);
});
*/
