var MessageView = Backbone.View.extend({
	initialize: function() {
		var self = this;
		//this.timer = setInterval(function() {console.log('Hello');self.model.fetch();},10000);
		console.log("initialize");
		_.bindAll(this,"sendMessageNow");
		this.model.set({mainUser: window.mainUser.id});
		
		this.listenTo(this.model,"change",this.render);
	},
	events: {
		"click #sendMsgBtn": "sendMessageNow",
		"click #backBtn": "goBack"
	},
	render: function() {
		//this.messagesLength = this.model.messages.length;
		if(!this.el) {
			//clearInterval(this.timer);
		}
		$(this.el).html( this.template( this.model.toJSON() ) );
		this.$("#messageDIV").scrollTop(this.$("#messageDIV").height()+500);
		return this;
	},
	goBack: function() {
		console.log("goback");
	},
	sendMessageNow: function() {
		console.log('send message');
		var self = this;
		
		this.model.save({content:$("#msgText").val()},{
			wait: true,
			success: function( data ) {
			//	alert('your message has been sent to ' + self.model.toJSON().firstName)
			},
		});
	}
})
