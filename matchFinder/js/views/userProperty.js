var UserPropertyView = Backbone.View.extend({
	initialize: function() {
		_.bindAll(this,"propertyChanged");
		this.virgin = true;
	},
	events: {
		"change .propertyCheckBox":"propertyChanged",
	},
	render: function() {
		$(this.el).html( this.template( this.model ) );
		return this;
	},
	propertyChanged: function(event) {
		console.log("changed	");
		this.virgin = false;
		this.optionId = $(event.currentTarget).val();
		
		
		var self = this;
		_.each(this.model.get("properties"),function(option) {
			if( self.optionId == option.id) {
				self.model.set({selectedOption: option});
				self.trigger("updateOption",option);
			}
		})
		
	}
})
