var expect = require("chai").expect;
var togglAPI = require("../app/Toggl.js");

describe("Toggl client", function() {
  describe("Users in slack cache", function() {
    it("should have nothing", function() {
      var toggl = new togglAPI();
      //expect(toggl.UsersInSlack).to.be.empty;
    });
  });
});
