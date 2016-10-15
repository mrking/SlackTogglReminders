var expect = require("chai").expect;
var assert = require('chai').assert;
var TimeReport = require("../app/TimeReport.js");

var USER_MIN_HOURS = process.env.USER_MIN_HOURS;
var USER_MIN_HOURS_IN_DAYS = process.env.USER_MIN_HOURS_IN_DAYS;

describe("TimeReport", function() {
    this.timeout(15000);

    it("with missing parameters should throw an error", function() {
      expect(function() { new TimeReport();}).to.throw(TimeReport.prototype.MISSING_PARAMETERS);
      expect(function() { new TimeReport({});}).to.throw(TimeReport.prototype.MISSING_PARAMETERS);
      expect(function() { new TimeReport({}, 1);}).to.throw(TimeReport.prototype.MISSING_PARAMETERS);
      expect(function() { new TimeReport({}, 1, new Date());}).to.throw(TimeReport.prototype.MISSING_PARAMETERS);
      expect(function() { new TimeReport({}, 1, new Date(), new Date()); }).to.not.throw(TimeReport.prototype.MISSING_PARAMETERS);
    });

    it("with bad parameters should throw an error", function() {
      expect(function() { new TimeReport({}, 1, "not a date", "not a date"); }).to.throw(TimeReport.prototype.EXPECTED_DATE_TYPE);
      expect(function() { new TimeReport({}, 1, new Date(), "not a date"); }).to.throw(TimeReport.prototype.EXPECTED_DATE_TYPE);
      expect(function() { new TimeReport({}, 1, "not a date", new Date()); }).to.throw(TimeReport.prototype.EXPECTED_DATE_TYPE);
    });

    it("with provided start and end time to get return back same times", function() {
      var d1 = new Date(14);
      var d2 = new Date(10000);
      var tr = new TimeReport({}, 1, d1, d2);

      expect(tr.getStartTime()).to.equal(d1);
      expect(tr.getStartTime()).to.not.equal(d2);
      expect(tr.getEndTime()).to.equal(d2);
      expect(tr.getEndTime()).to.not.equal(d1);
    });

    it("to help generate date ranges based on environment variable", function() {
      var dates = TimeReport.getDefaultDates();
      var start = new Date(2016,01,01);

      expect(dates[0] - dates[1]).to.equal(USER_MIN_HOURS_IN_DAYS * 24 * 60 * 60 * 1000);

      dates = TimeReport.getDefaultDates(start);
      expect(dates[0] - dates[1]).to.equal(USER_MIN_HOURS_IN_DAYS * 24 * 60 * 60 * 1000);
      expect(dates[0]).to.equal(start);
    });

    it("to tell us if user met hour requirements", function() {
      var dates = TimeReport.getDefaultDates();
      var d1 = new Date(2016,01,01);
      var d2 = new Date(2016,01,03);
      var hoursPerDay = USER_MIN_HOURS / USER_MIN_HOURS_IN_DAYS;

      expect(new TimeReport({}, hoursPerDay * -1, d1, d2).meetExpectedHours()).to.be.false;
      expect(new TimeReport({}, hoursPerDay * 0, d1, d2).meetExpectedHours()).to.be.false;
      expect(new TimeReport({}, hoursPerDay * 1.999, d1, d2).meetExpectedHours()).to.be.false;
      expect(new TimeReport({}, hoursPerDay * 2, d1, d2).meetExpectedHours()).to.be.true;
      expect(new TimeReport({}, hoursPerDay * 2.001, d1, d2).meetExpectedHours()).to.be.true;
      expect(new TimeReport({}, hoursPerDay * 200, d1, d2).meetExpectedHours()).to.be.true;

    });
});
