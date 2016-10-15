var togglAPI = require('./Toggl.js');
var slackAPI = require('./Slack.js');

var USER_MIN_HOURS = process.env.USER_MIN_HOURS;
var USER_MIN_HOURS_IN_DAYS = process.env.USER_MIN_HOURS_IN_DAYS;

/**
 * Timereport is a centralized class for reporting on a user's time in submitted in toggl.
 * @param {Slack User} user Slack user object
 * @param {int} time Number of recorded hours
 * @param {Date} [start=Now-USER_MIN_HOURS_IN_DAYS] The start date of the report
 * @param {Date} [end=Now] The end date of the report
 */
function TimeReport(user, time, start, end) {
  if(!user || time === undefined || !start || !end)
    throw (TimeReport.prototype.MISSING_PARAMETERS);
  if(!(start instanceof Date))
    throw (TimeReport.prototype.EXPECTED_DATE_TYPE);
  if(!(end instanceof Date))
    throw (TimeReport.prototype.EXPECTED_DATE_TYPE);

    this._user = user;
    this._hoursRecorded = time;
    this._start = start;
    this._end = end;
}

TimeReport.prototype = {
  MISSING_PARAMETERS: new Error("MISSING_PARAMETERS"),
  EXPECTED_DATE_TYPE: new Error("EXPECTED_DATE_TYPE"),
  /**
   * gets the start date of the report
   * @return {date} returns a date object containing the start date
   */
  getStartTime: function() {
    return this._start;
  },
  /**
   * gets the end date of the report
   * @return {date} returns a date object containing the end date
   */
  getEndTime: function() {
    return this._end;
  },

  /**
    * Returns the slack user object of the person being report on
    * @return {Slack User} Returns the slack user object of the person being reported on
    */
    getUser: function() {
        return this._user;
    },

    /**
     * Gets the number of recorded hours
     * @return {int} an integer reporting the number of hours
     */
    getHoursRecorded: function() {
        return this._hoursRecorded;
    },

    /**
     * Determines if the user has met the minimum number of hours
     * @return {bool} a boolean representing if the user has meet expected hours
     */
    meetExpectedHours: function() {
        var days = Math.abs((this.getEndTime().getTime() - this.getStartTime().getTime())/(24*60*60*1000));
        var ratio = days / USER_MIN_HOURS_IN_DAYS;
        return this.getHoursRecorded() >= USER_MIN_HOURS*ratio;
    },

    /**
     * a string representing the report
     * @return {[type]} [description]
     */
    toString: function() {
        if (this.meetExpectedHours()) {
            return this.getUser().real_name + " has recorded " + this.getHoursRecorded().toPrecision(3) + " work hours for the week";
        } else {
            return this.getUser().real_name + " has recorded " + this.getHoursRecorded().toPrecision(3) + " work hours for the week, and are behind the minimum hours by " + (USER_MIN_HOURS - this.getHoursRecorded()).toPrecision(3) + " hours of the total " + USER_MIN_HOURS;
        }
    },
};

    /**
     * a helper function that returns default date ranges if none are provided based on USER_MIN_HOURS_IN_DAYS environment variable
     * @param  {Date} [start=new Date()] optional date parameter if you want to get corresponding default date end range
     * @return {[Date]} two item array containing Dates, [0] = start, [1] = end
     */
TimeReport.getDefaultDates = function(start) {
      start = start || new Date();
      var end = new Date(start);
      end.setDate(start.getDate() - USER_MIN_HOURS_IN_DAYS);
      return [start, end];
    };

TimeReport.generateTimeReport = function(email, start, end) {
    if(!start || !end) {
      var defaults = TimeReport.getDefaultDates(start);
      start = start || defaults[0];
      end = end || defaults[1];
    }

    return Promise.all([togglAPI.getTimeSpent(start, end, email), slackAPI.getUser(email)])
        .then(function(values) {
            var time = values[0];
            var user = values[1];
            return new TimeReport(user, time, start, end);
        });
};

module.exports = TimeReport;
