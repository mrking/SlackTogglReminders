var TogglClient = require('toggl-api');

// CONST
var TOGGL_WORKSPACE_NAME = process.env.TOGGL_WORKSPACE_NAME;
var TOGGL_API_TOKEN = process.env.TOGGL_API_TOKEN;

var toggl = new TogglClient({apiToken: TOGGL_API_TOKEN});
var UsersInToggl = {};
var WorkspacesInToggl = {};

function TogglInterfaceError(Message, ErrorCode, err) {
    this.self = this;
    this.self._message = Message;
    this.self._err = err;
    this.self._errCode = ErrorCode;
    console.error('TogglInterfaceError: %s; %s; %s', Message, ErrorCode, err);
}

TogglInterfaceError.prototype = {
  getMessage: function() {
    return this.self._message;
  },
  getError: function() {
    return this.self._err;
  },
  getErrorCode: function() {
    return this.self._errCode;
  },

  ERROR_CODE_SLACK_WORKSPACE_USERS:Symbol('ERROR_CODE_SLACK_WORKSPACE_USERS'),
  ERROR_CODE_USER_NOT_FOUND:Symbol('ERROR_CODE_USER_NOT_FOUND'),
  ERROR_CODE_WORKSPACE_ID_UNAVAILABLE:Symbol('ERROR_CODE_WORKSPACE_ID_UNAVAILABLE')
};

var self = module.exports = {
  error: TogglInterfaceError,
  getCachedUsers: function() {
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
                if(err)
                  reject (new TogglInterfaceError('Error attempting to get workspace users from Slack' ,TogglInterfaceError.prototype.ERROR_CODE_SLACK_WORKSPACE_USERS, err));

                // Save users into our cache object
                for (var i = 0; i <  users.length; i++) {
                  UsersInToggl[users[i].email] = users[i];
                }

                if(UsersInToggl[email]) {
                  console.info('found our look up user using email ' + email);
                  resolve(UsersInToggl[email]);
                  return;
                } else {
                  reject(new TogglInterfaceError('unable to find ' + email +  ' in toggl', TogglInterfaceError.prototype.ERROR_CODE_USER_NOT_FOUND , null));
                  return;
                }
              });
            }, function(err) {
              reject(new TogglInterfaceError('Unable to find workspace ID for: ' + TOGGL_WORKSPACE_NAME, TogglInterfaceError.prototype.ERROR_CODE_WORKSPACE_ID_UNAVAILABLE, err ));
            });
        });
      }
    },
    // returns a promise for the configured workspace ID in the config file.
    getWorkspaceID: function(workspaceName) {
      if(WorkspacesInToggl[workspaceName]) {
          return Promise.resolve(WorkspacesInToggl[workspaceName].id);
      } else {
        return new Promise(function (resolve, reject) {
          toggl.getWorkspaces(function(err, workspaces) {
            for (var i = 0; i < workspaces.length; i++) {
              if(workspaceName == workspaces[i].name) {
                 WorkspacesInToggl[workspaceName] = workspaces[i];
                 console.info('Was able to resolve console ID to be ' + WorkspacesInToggl[workspaceName].id);
                 resolve(WorkspacesInToggl[workspaceName].id);
                 return;
               }
             }

             reject(new TogglInterfaceError('Was unable to find workspace with name: ' + workspaceName , TogglInterfaceError.prototype.ERROR_CODE_WORKSPACE_ID_UNAVAILABLE, null));
           });
        });
      }
    },
    // a promise to return a users time.
    getTimeSpent: function (start, end, email) {
      return new Promise(function(resolve, reject) {
        self.getUser(email).then(function(user) {
          self.getWorkspaceID(TOGGL_WORKSPACE_NAME).then(function(WorkspaceID) {
          toggl.summaryReport({"grouping": "users", "workspace_id": WorkspaceID, "user_ids": user.id, "since": start.toISOString().slice(0,10), "until": end.toISOString().slice(0,10)}, function(err, report) {
            if(err) {
              reject(err);
            } else {
              resolve(report.total_grand / 3600000);
            }
          });
        });
       });
     });
   }
 };
