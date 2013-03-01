var UserModel = Backbone.Model.extend({
	getStatus: function() {
		var self = this;
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
			  self.getInfo();
			} else if (response.status === 'not_authorized') {
			  self.facebookLogin();
			} else {
			  self.facebookLogin();
			}
		 });
	},
	url: "api/user",
	getInfo: function () {
		var self = this;
	    console.log('Welcome!  Fetching your information.... ');
	    FB.api('/me', function(response) {
	        console.log('Here is the power of json:, ' + JSON.stringify(response) + '.');
	            self.set({email:response.email,fbId:response.id,last_name:response.last_name,first_name:response.first_name,
	        	gender:response.gender,location:JSON.stringify(response.location)
	        	,username:response.username,facebookInfo:JSON.stringify(response)});
	        	self.save(null,{error: function() {alert("error")}, success: function(model) {
					self.trigger('ready',this);
	        	}});
	    });
	},
	facebookLogin: function() {
		var self = this;
		    FB.login(function(response) {
        if (response.authResponse) {
           self.getInfo();
        } else {
        	this.trigger('fail',this);
        }
    },{scope: 'email'});
	},
});

var ResultModel = Backbone.Model.extend({
	initialize: function() {
		
	},
	defaults: {
		moves:0,
		time:0,
	}
});

var Results = Backbone.Collection.extend({
	model: ResultModel,	
	url: "api/results",
})

var PuzzleModel = Backbone.Model.extend({
	urlRoot: "api/puzzle",
});

var PuzzleCollection = Backbone.Collection.extend({
	url: "api/puzzles",
})


