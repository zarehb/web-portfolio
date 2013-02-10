var LoginView = Backbone.View.extend({
	initialize: function() {
	},
	events: {
		"click #facebook": "facebookLoginClicked",
		"hidden #loginModal": "proceed",
	},
	render: function() {
		var self = this;
		$(this.el).html( this.template() );
		
		return this;
	},
	proceed: function() {
		router.navigate("user", {trigger: true});
	},
	showLoadingModal: function() {
		this.$('#loginModal').modal({backdrop: 'static', keyboard: false});
		this.$('#loginModal #barPorgress').animate({ width: 500},10000);
	},
	facebookLoginClicked: function() {
		this.showLoadingModal();	
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
	facebookLogin: function() {
		var self = this;
		    FB.login(function(response) {
        if (response.authResponse) {
           self.getInfo();
        } else {
        	this.$('#loginModal').modal('hide');
        }
    },{scope: 'email'});
	},
	getInfo: function () {
		var self = this;
	    console.log('Welcome!  Fetching your information.... ');
	    FB.api('/me', function(response) {
	        console.log('Here is the power of json:, ' + JSON.stringify(response) + '.');
	        
	        window.mainUser.set({email:response.email,fbId:response.id,last_name:response.last_name,first_name:response.first_name,
	        	gender:response.gender,location:JSON.stringify(response.location)
	        	,username:response.username,facebookInfo:JSON.stringify(response)});
	        window.mainUser.save(null,{error: function() {alert("error")}, success: function(model) {
				self.$('#loginModal').modal('hide');
	        	}});
	    });
	},
})
