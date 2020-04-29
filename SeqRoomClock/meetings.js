var BD = BD || {};

BD.Meeting = Backbone.Model.extend({
    url: function () {
      return this.instanceUrl;
    },

    defaults: {
        name: "---",
	start: "",
        end: ""

	},

    initialize:  function(props){
        this.instanceUrl = props.url;

	// Sync up the fetch with the actual clock minute change.
	var d = new Date();
	var delay = 60000.0 - ((d.getSeconds() * 1000) + d.getMilliseconds());

	var that = this;
        setTimeout(function(){

            that.fetch({
 	        error: function(){ that.setName();}
            });

            setInterval(function(){that.fetch({
			    error: function(){ that.setName();}
            });} , 60000);
        }, delay);
    },

    setName: function(){
        this.set("name", this.defaults.name);
    }
});



BD.CountdownClock = Backbone.Model.extend({
    defaults: {
        timeRemainingString: "00:00:00"
    },

    initialize: function(props){
        this.watchModel = props.watchModel;
	if(typeof props.watchModel2 != undefined){
	    this.watchModel2 = props.watchModel2;
	}

        this.listenTo(this.watchModel, "change:start", function() {
	    this.setSecsDiff();	
        });

	var that = this;
	setInterval(function(){that.updateClock();}, 1000);
    },

    updateClock: function() {
        this.set( "timeRemainingString", BD.secondsToClock(this.get("secsDiff") ) );
	this.set("secsDiff", (this.get("secsDiff") - 1));

        // Update the model whenever the timer runs out so the counter doesn't underrun.
	if(this.get("secsDiff") === -1){
	    this.watchModel.fetch();
	    if(typeof this.watchModel2 != undefined){
	        this.watchModel2.fetch();
	    }
	}

	// Once a minute update the time remaining to correct for any setInterval drift.
	// The first clause is to keep it from updating at the very end.
        if( this.get("secsDiff") != 0 && this.get("secsDiff") % 60 === 0){
	    this.setSecsDiff();
	}

    },

    setSecsDiff: function () {
        var nextMeetingMillis = BD.specialParseDate(this.watchModel.get("start")).valueOf();
	var d = moment.tz("America/Los_Angeles");
	var currMillis = d.valueOf(); //new Date().getTime();
	var secsDiff = Math.floor( (nextMeetingMillis/1000) - (currMillis/1000) );
	this.set("secsDiff",  secsDiff);
	//        var nextMeetingMillis = BD.specialParseDate(this.watchModel.get("start")).getTime();
	//	var currMillis = new Date().getTime();
	//	this.set("secsDiff", Math.floor( (nextMeetingMillis/1000) - (currMillis/1000) ) );
    }


});


BD.CountdownClockCurrent = Backbone.Model.extend({
    defaults: {
        timeRemainingString: "00:00:00"
    },

    initialize: function(props){
        this.watchModel = props.watchModel;

        this.listenTo(this.watchModel, "change:end", function() {
	    this.setSecsDiff();	
        });

        this.listenTo(this.watchModel, "change:start", function() {
	    this.setSecsDiff();	
        });

	var that = this;
	setInterval(function(){that.updateClock();}, 1000);
    },

    updateClock: function() {
      if(this.watchModel.get("name") != "---"){
        this.set( "timeRemainingString", BD.secondsToClock(this.get("secsDiff") ) );
	this.set("secsDiff", (this.get("secsDiff") - 1));

        // Update the model whenever the timer runs out so the counter doesn't underrun.
	if(this.get("secsDiff") === -1){
	    this.set("secsDiff", 0);
	    var that = this;
	    this.watchModel.fetch({error: function() { that.watchModel.setName(); } });
	}

	// Once a minute update the time remaining to correct for any setInterval drift.
	// The first clause is to keep it from updating at the very end.
        if( this.get("secsDiff") != 0 && this.get("secsDiff") % 60 === 0){
	    this.setSecsDiff();
	}
      }
      else {
	//	console.log("Seconds should be 0");
	this.set("secsDiff", 0);
	this.set("timeRemainingString", "00:00:00");
      }

    },

    setSecsDiff: function () {
        if(typeof this.watchModel.get("end") != undefined){
	    var endOfMeetingMillis = BD.specialParseDate(this.watchModel.get("end")).valueOf();
            var d = moment.tz("America/Los_Angeles");
	    var currMillis = d.valueOf();
	    var secsDiff = Math.floor( (endOfMeetingMillis/1000) - (currMillis/1000) );
	    this.set("secsDiff",  secsDiff);

	  //            var endOfMeetingMillis = BD.specialParseDate(this.watchModel.get("end")).getTime();
	  //  var currMillis = new Date().getTime();
	  // this.set("secsDiff", Math.floor( (endOfMeetingMillis/1000) - (currMillis/1000) ) );
        }
	else {
	  this.set("secsDiff", 0);
	  //	  this.watchModel.fetch();
	}
    }


});


BD.Planning = Backbone.Model.extend({
    url: function () {
      return this.instanceUrl;
    },

    defaults: {
        name: "APAM",
	sol: "NONE"
	},

    initialize:  function(props){
        this.instanceUrl = props.url;

	var that = this;
        setInterval( function(){ that.fetch({error: function() { console.log("planning error");      } }); } , 600000); // Don't need to check this very often.
    }

});





// Parse the date as it is returned from the database and return a javascript Date object.
BD.specialParseDate = function (str) {
        var re = /(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/;
	str.match(re);
	var year   = RegExp.$1; 
	var month  = RegExp.$2; 
	var day    = RegExp.$3; 
	var hour   = RegExp.$4; 
	var minute = RegExp.$5; 
	var second = RegExp.$6;
	var timestring = year + "-" +  month + "-" + day + "T" + hour + ":" + minute + ":" + second;
	var m = moment.tz( timestring , "America/Los_Angeles");
	return m;

	//        return new Date(parseInt(RegExp.$1,10), 
	//               (parseInt(RegExp.$2,10) - 1), 
	//                parseInt(RegExp.$3,10), 
	//                parseInt(RegExp.$4,10), 
	//                parseInt(RegExp.$5,10), 
	//                parseInt(RegExp.$6,10) );
    }

// Converts a raw seconds count to an HH:MM:SS type of display.
BD.secondsToClock = function (secs) {
        if(secs === undefined || isNaN(secs)){
            return "00:00:00";
        }
        var hours = Math.floor(secs/60/60);
        secs -= (hours * 60 * 60);
        var mins = Math.floor(secs/60);
        secs -= mins * 60;

        hours = hours < 10 ? "0" + hours : hours;
        mins = mins < 10 ? "0" + mins : mins;
        secs = secs < 10 ? "0" + secs : secs;

        return hours + ":" + mins + ":" + secs;
    }
