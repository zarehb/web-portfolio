var UserPropertiesView = Backbone.View.extend({
		tagName: "ul",
		events: {
		"click #saveChanges":"saveChanges",
		},
		initialize: function() {
			_.bindAll(this,"render","saveChanges");
	},
	saveChanges: function() {
		this.complete = true;
		var self = this;
		
		if(mainUser.get("virgin") != '0') {
			_.each(this.model.models,function(propertyModel){
				if(!propertyModel.get("selectedOption") && self.complete) {
					self.complete = false;
					alert("All the Options are required");
				}
			});
		}
		if(this.complete) {
			//this.model.sync();
			window.mainUser.save({},{success: function(){ window.mainUser.fetch({success: function() {window.router.navigate('user',{trigger: true});	}});}});
			console.log("save selected options");
		}
		
	},
	updateOption: function(option) {
		var found = false;
		if(window.mainUser.get("options") == undefined) {
			window.mainUser.set("options",[]);
		}
		_.each(window.mainUser.get("options"),function(userOption) {
			if(userOption.propertyId == option.propertyId ) {
				userOption.option_id = option.id;
				userOption.rank = option.rank;
				found = true;
			}
		})
		if(!found) {
			option.option_id = option.id;
			window.mainUser.get("options").push(option);
		}
	},
	render: function() {
		var self = this;
		
		if(!this.$(".propertyView").size()) {
			$(this.el).html(this.template());
			_.each(this.model.models,function(propertyModel){
				var divId = propertyModel.get('name').replace(/ /g, '');
				propertyModel.set('divId',divId);
				var property = new UserPropertyView({
					model: propertyModel,
				});
				property.on("updateOption",function(data) {
					self.updateOption(data);
				})
				$(this.el).find("#questions").append(property.render().el);
				//$(this.el).find("#titles").append("<li><a href='#" + divId + "'>" + propertyModel.get('name') +"</a></li>");
				
			},this)
		}
		return this;
	},
	});
