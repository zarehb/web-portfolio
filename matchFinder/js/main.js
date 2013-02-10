window.Router = Backbone.Router.extend({
	routes : {
		"" : "start",
		"user" : "showUser",
		"questions" : "showProperties",
		"message/:userId" : "showMessage",
	},
	initialize : function() {
		_.bindAll(this, ["showUser"]);
		var self = this;

		if ( typeof (window.user) != "undefined") {
			window.mainUser = new User(window.user);
		} else {
			window.mainUser = new User();
		}
		window.userProperties = new UserProperties(window.properties);
		window.headerView = new HeaderView({
			el : $("#header"),
		});
		window.headerView.render();
	},
	start : function() {
		if ( typeof (window.mainUser.get("id")) != "undefined") {
			if (window.mainUser.get("virgin") == "1") {
				router.navigate("questions", {
					trigger : true
				});
			} else {
				router.navigate("user", {
					trigger : true
				});
			}
		} else {
			this.showLogin();
		}
	},
	showMessage : function(userId) {
		var self = this;
		var message = new MessageModel({
			id : userId
		});

		if ( typeof (messages) == "undefined") {
			messages = new Messages();
			messsageView = new MessageView({
					el : "#content",
			})
		}
		messages.add(message);
		messsageView.model = message;
		message.fetch({
			success : function() {
				messsageView = new MessageView({
					el : "#content",
					model : message
				})
				this.messsageView.render();
			}
		});
	},
	showLogin : function() {
		var loginView = new LoginView({
			el : $("#content"),
		});
		loginView.render();
	},
	showProperties : function() {
		if ( typeof (propertiesView) == "undefined") {
			propertiesView = new UserPropertiesView({
				el : $("#content"),
				model : window.userProperties,
			});
		}
		propertiesView.render();
	},
	showUser : function() {
		var self = this;
		if (!window.mainUser) {
			window.mainUser = new User();
			window.mainUser.fetch({
				success : function() {
					self.showUser();
				}
			});
			//window.router.navigate('',{trigger: true});
		} else {
			if (window.mainUser.get("virgin") == "1") {
				window.router.navigate("questions", {
					trigger : true
				});
			} else {
				if ( typeof (userView) == "undefined") {
					userView = new UserView({
						el : $("#content"),
						model : window.mainUser,
					});
				}
				userView.render();
			}
		}
	}
})
$(function() {
	templateLoader.load(["HomeView", "UserView", "ResultView", "MessageView", "LoginView", "UserPropertyView", "UserPropertiesView", "HeaderView", "FriendsView"], function() {
		window.router = new Router();
		Backbone.history.start();
	});
});
