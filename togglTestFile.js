var TogglClient = require('toggl-api');
var Settings = require('./settings.json');

var toggl = new TogglClient({apiToken: Settings.toggleAPItoken});

toggl.getWorkspaces(function(err, workspaces) {

  // get workspace names
  for (var i = 0; i < workspaces.length; i++) {
    console.log(workspaces);
    if(Settings.toggleWorkspaceName.indexOf(workspaces[i].name) > -1) {
        console.log('found the workspace');
        // get workspace users
        toggl.getWorkspaceUsers(workspace[i].id, function(err, users) {
          console.log('found some users');
          console.log(users);

        });
    }
  }
});
