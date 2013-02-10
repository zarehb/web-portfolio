var Friend = Backbone.Model.extend({
});

var Friends = Backbone.Collection.extend({
		model: Friend,
});

var User = Backbone.Model.extend({
	url:"api/user",
	initialize: function() {
		this.messages = new Friends( this.get('messages') );
		this.set({messages: this.messages});
	},
	defaults: {
	}
});

var LoginUser = Backbone.Model.extend({
	url: "api/user",
});

var MessageModel = Backbone.Model.extend({
	initialize: function() {
		console.log('message model');
	}
})

var Messages = Backbone.Collection.extend({
	url: "api/messages",
	model: MessageModel,
})

var Result = Backbone.Model.extend({
	defaults: {
		user: null,
		similarity: 0,
	}
});

var Results = Backbone.Collection.extend({
	url: function() {
		return "api/match/"+this.min+"/"+this.max+"/"+this.page; 
	},
	model: Result,
	min: 90,
	max: 100,
	page: 1,
	initialize : function() {
	}
});

var UserProperty = Backbone.Model.extend({
	initialize: function () {
	},
	selected: function(id) {
		var sel = false;
		if(window.mainUser) {
		_.each(window.mainUser.get("options") ,function(option) {
			if(option.option_id == id) {
				sel = true;
			};
			
		});
		}
		return sel;
	} 
});

var UserProperties = Backbone.Collection.extend({
	model: UserProperty,
	url:"api/properties",
	initialize: function () {
	},
	getProperty: function(optionId) {
		var sel = false;
		_.each(this.models,function(property) {
			_.each(property.properties,function(option) {
					if(option.id == optionId) {
						return property;
					}
			})
		});
		return null;
	},
});


