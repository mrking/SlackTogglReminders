var expect = require("chai").expect;
var toglAPI = require("../app/Toggl.js");

describe("Toggl client", function() {
  describe("Users in slack cache", function() {
    it("should have nothing", function() {
      var toggl = new toglAPI();
      expect(toggl.UsersInSlack).to.be.empty;
    });
  });
});
