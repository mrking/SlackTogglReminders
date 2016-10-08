var TogglClient = require('toggl-api');

// CONST
var TOGGL_WORKSPACE_NAME = process.env.TOGGL_WORKSPACE_NAME;
var TOGGL_API_TOKEN = process.env.TOGGL_API_TOKEN;

var WorkspaceID = -1;
var toggl = new TogglClient({apiToken: TOGGL_API_TOKEN});


var self = module.exports = {
  var UsersInToggl = {};
  getCachedUsers = function() {
    return UsersInToggl;
  },
  // returns a promise for the user object with a parameter of an email address string
  getUser: function(email) {
      if(UsersInToggl[email]) {
        return Promise.resolve(UsersInToggl[email]);
      } else {
        return new Promise(function (resolve, reject) {
            // test ws ID 1382104
            self.getWorkspaceID(TOGGL_WORKSPACE_NAME).then(function(wsID) {
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
              });
            }, function() {
              console.error ('Unable to find workspace ID for: ' + TOGGL_WORKSPACE_NAME);
            });
        });
      }
    },
    // returns a promise for the configured workspace ID in the config file.
    getWorkspaceID: function(workspaceName) {
      if(WorkspaceID != -1) {
          return Promise.resolve(WorkspaceID);
      } else {
        return new Promise(function (resolve, reject) {
          toggl.getWorkspaces(function(err, workspaces) {
            for (var i = 0; i < workspaces.length; i++) {

              if(workspaceName == workspaces[i].name) {
                 WorkspaceID = workspaces[i].id;
                 resolve(WorkspaceID);
               }
             }

             if(WorkspaceID == -1 ) {
               reject('Was unable to find workspace with name: ' +  workspaceName);
             }
           });
        });
      }
    },
    // a promise to return a users time.
    getTimeSpent: function (start, end, email) {
      return new Promise(function(resolve, reject) {
        self.getUser(email).then(function(user) {
        toggl.summaryReport({"grouping": "users", "workspace_id": WorkspaceID, "user_ids": user.id, "since": start.toISOString().slice(0,10), "until": end.toISOString().slice(0,10)}, function(err, report) {
          if(err) {
            reject(err);
          } else {
            resolve(report.total_grand / 3600000);
          }
        });
       });
     });
   }
 };



/*
 console.log('test getTimeSpent for Michael');
 module.exports.getTimeSpent(new Date(2016,01,01), new Date(), 'mikerobertking@gmail.com').then(function(response) {
   console.log("Success! Hours spent: ", response);
 }, function(error) {
   console.error("Failed!", error);
 });
*/

// example calls
/*getTimeSpent('2016-07-01', '2016-12-01', 'mikerobertking@gmail.com', function(err, time) {
  console.log("got Mike's hours: " + time);
});
getTimeSpent('2016-07-01', '2016-12-01', 'new.overlord@gmail.com', function(err, time) {
  console.log("got Tyrone's hours: " + time);
});
*/
