var togglAPI = require('./Toggl.js');
var slackAPI = require('./Slack.js');

var USER_MIN_HOURS = process.env.USER_MIN_HOURS;
var USER_MIN_HOURS_IN_DAYS = parseInt(process.env.USER_MIN_HOURS_IN_DAYS);

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
     * Gets the required nubmer of hours for the range
     * @return {int} int representing the required number oh hours for the date range.
     */
    getRequiredHours: function() {
          var days = Math.abs((this.getEndTime().getTime() - this.getStartTime().getTime())/(24*60*60*1000));
          var ratio = days / USER_MIN_HOURS_IN_DAYS;
          return USER_MIN_HOURS*ratio;
    },

    /**
     * Determines if the user has met the minimum number of hours
     * @return {bool} a boolean representing if the user has meet expected hours
     */
    meetExpectedHours: function() {
        return this.getHoursRecorded() >= this.getRequiredHours();
    },

    /**
     * a string representing the report
     * @return {[type]} [description]
     */
    toString: function() {
        if (this.meetExpectedHours()) {
            return this.getUser().real_name + " has recorded " + this.getHoursRecorded().toPrecision(3) + " work hours for the date range from " + this.getStartTime().toISOString() + " to " + this.getEndTime().toISOString();
        } else {
            return this.getUser().real_name + " has recorded " + this.getHoursRecorded().toPrecision(3) + " work hours for the date range from " + this.getStartTime().toISOString() + " to " + this.getEndTime().toISOString()+ ", and are behind the minimum hours by " + (this.getRequiredHours() - this.getHoursRecorded()).toPrecision(3) + " hours of the total " + this.getRequiredHours();
        }
    },
};

    /**
     * a helper function that returns default date ranges if none are provided based on USER_MIN_HOURS_IN_DAYS environment variable
     * @param  {Date} [start=new Date()] optional date parameter if you want to get corresponding default date end range
     * @return {[Date]} two item array containing Dates, [0] = start, [1] = end
     */
TimeReport.getDefaultDates = function(start) {
      var end = new Date();
      if(!start) {
        start = new Date(end);
        start.setDate(start.getDate() - USER_MIN_HOURS_IN_DAYS);
      } else {
        end = new Date(start);
        end.setDate(end.getDate() + USER_MIN_HOURS_IN_DAYS);
      }

      return [start, end];
    };

/**
 * Generates a time report object for a user
 * @param  {string} email user's email address registered in toggl
 * @param  {date} [start=Now-USER_MIN_HOURS_IN_DAYS] start time of the report
 * @param  {date} [end=Now-USER_MIN_HOURS_IN_DAYS] end time of the report
 * @return {TimeReport}  a promise for report detailing the users time
 */
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
