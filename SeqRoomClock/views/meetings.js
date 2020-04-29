var BD = BD || {};

BD.MeetingView = Backbone.View.extend({
    tagName: "div",

    initialize:  function(props) {
        this.template = _.template($(props.templ).html());
        this.render();
        this.listenTo(this.model, "change", this.render);  
    },

    render:  function(){
        var that = this;
	this.$el.fadeOut(750, function() {
            that.$el.html(that.template(that.model.toJSON()));
	    that.$el.fadeIn(750);	       
	});
	//        this.$el.html( this.template( this.model.toJSON() ) );
        return this;
    }

});


BD.CountdownClockView = Backbone.View.extend({
    el: "#countdown-clock",

    template: _.template($("#countdown-template").html()),

    initialize: function(){
        var that = this;
        this.listenTo(this.model, "change:timeRemainingString", function(){ that.render(); });
        this.render();
    },

    render: function(){
	var that = this;
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }


});

BD.CountdownClockViewCurrent = Backbone.View.extend({
    el: "#countdown-clock-current",

    template: _.template($("#countdown-current-template").html()),

    initialize: function(){
        var that = this;
        this.listenTo(this.model, "change:timeRemainingString", function(){ that.render(); });
        this.render();
    },

    render: function(){
      //        console.log('cdc');
	var that = this;
	if(this.model.get("timeRemainingString") === "00:00:00"){
	    this.$el.fadeOut(750);
	}
	else {
	    this.$el.fadeIn(750);
	}
	this.$el.html(this.template(this.model.toJSON()));
        return this;
    }


});


BD.PlanningView = Backbone.View.extend({
    el: "#planning",

    template: _.template($("#planning-template").html()),

    initialize: function(){
        var that = this;
        this.listenTo(this.model, "change:sol", function(){ that.render(); });
        this.render();
    },

    render: function(){
        var sol = this.model.get("sol");
        if(sol != "NONE"){
      	  sol = "SOL " + sol;
        }
	var that = this;
	this.$el.fadeOut(750, function() {
            that.$el.html(that.template({sol: sol}));
	    that.$el.fadeIn(750);	       
	});
        return this;
    }


});

