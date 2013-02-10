var ResultView = Backbone.View.extend({
	initialize: function() {
	},
	events: {
		"click #sendmsg": "sendMessage",
	},
	render: function() {
		$(this.el).html( this.template( this.model.toJSON() ) );
		return this;
	},
	sendMessage: function() {
		router.navigate("message/"+this.model.get("user_id"),{trigger: true});
		//this.trigger("sendMsg",this.model);
	}
})
