var expect = require("chai").expect;
var assert = require('chai').assert;
var TimeReport = require("../app/TimeReport.js");

describe("TimeReport", function() {
    this.timeout(15000);

    it("with missing parameters should throw an error", function() {
      console.log(TimeReport.prototype.MISSING_PARAMETERS);
      expect(new TimeReport()).to.throw(TimeReport.prototype.MISSING_PARAMETERS);
      expect(new TimeReport({})).to.throw(TimeReport.prototype.MISSING_PARAMETERS);
      expect(new TimeReport({},1)).to.throw(TimeReport.prototype.MISSING_PARAMETERS);
      expect(new TimeReport({},1,new Date())).to.throw(TimeReport.prototype.MISSING_PARAMETERS);
      expect(new TimeReport({}, 1, new Date(), new Date())).to.not.throw(TimeReport.prototype.MISSING_PARAMETERS);
    });

    it("with bad parameters should throw an error", function() {
      expect(new TimeReport({}, 1, "not a date", "not a date")).to.throw(TimeReport.prototype.EXPECTED_DATE_TYPE);
      expect(new TimeReport({}, 1, new Date(), "not a date")).to.throw(TimeReport.prototype.EXPECTED_DATE_TYPE);
      expect(new TimeReport({}, 1, "not a date", new Date())).to.throw(TimeReport.prototype.EXPECTED_DATE_TYPE);
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
});
