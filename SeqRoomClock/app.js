var BD = BD || {};

BD.start = function () {

    // Initialize the models
    var currentMeeting = new BD.Meeting({url: "https://mslreports.jpl.nasa.gov/surface/tactical/big_display/big_display.php?meeting=current"});
    var nextMeeting = new BD.Meeting({url: 'https://mslreports.jpl.nasa.gov/surface/tactical/big_display/big_display.php?meeting=next'});
    var countdownClock = new BD.CountdownClock({watchModel: nextMeeting, watchModel2: currentMeeting});
    var countdownClockCurr = new BD.CountdownClockCurrent({watchModel: currentMeeting});
    var planning = new BD.Planning({url: 'https://mslreports.jpl.nasa.gov/surface/tactical/big_display/big_display.php?meeting=apam'});

    // Initialize the views
    var currentMeetingView = new BD.MeetingView({model: currentMeeting, el: "#current-meeting", templ: "#current-meeting-template"});
    var nextMeetingView = new BD.MeetingView({model: nextMeeting, el: "#next-meeting", templ: "#next-meeting-template"});
    var countdownClockView = new BD.CountdownClockView({model:countdownClock});
    var countdownClockViewCurrent = new BD.CountdownClockViewCurrent({model: countdownClockCurr});
    var planningView = new BD.PlanningView({model:planning});

    currentMeeting.fetch({"success": function(m) {  }});
    nextMeeting.fetch({"success": function(m) {    }});
    planning.fetch();
}
