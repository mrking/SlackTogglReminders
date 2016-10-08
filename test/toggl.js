var expect = require("chai").expect;
var togglAPI = require("../app/Toggl.js");

describe("Our toggl API test account ", function() {
    this.timeout(30000);
    describe("users in toggl cache", function() {
        it("should have nothing at init", function() {
            expect(togglAPI.getCachedUsers()).to.be.empty;
        });
    });
    describe("users", function() {
        it("should have mike", function(done) {
            return togglAPI.getUser('mikerobertking@gmail.com').then(function(user) {

                expect(user).to.exist;
                expect(user.email).to.be.equal('mikerobertking@gmail.com');
                done();
            });
        });
        it("shouldn't have fakemike", function(done) {
            return togglAPI.getUser('fakemikerobertking@gmail.com').then(function(users) {

            }, function(err) {
                // TODO add expected error type assertion
                expect(err).to.exist;
                done();
            });
        });
        it("BLAH", function(done) {
            var email = "lasdflaksdjflkasjdf@laksflasd.com";

            return togglAPI.getUser(email).then(function() {}, function(err) {
                expect(err).to.exist;
                done();
            });
        });
        it("BLAH", function(done) {
            var email = "new.overlord@gmail.com";

            return togglAPI.getUser(email).then(function(user) {
                expect(user.id).to.exist;
                expect(user.email).to.equals("new.overlord@gmail.com");
                done();
            });
            it("BLAH", function(done) {
                var email = "new.overlord@gmail.com";
                var startPeriod = new Date();
                startPeriod.setDate(startPeriod.getDate() - 7);

                return togglAPI.getTimeSpent(new Date, startPeriod, email).then(function(report) {
                    expect(report).to.exist;
                    done();
                    //expect(user.email).to.equals("new.overlord@gmail.com")
                });
            });
        });
    });
});
