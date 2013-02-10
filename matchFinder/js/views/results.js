var ResultsView = Backbone.View.extend({
	tagName: "ul",
	initialize: function() {
	},
	render: function() {
		var self = this;
		_.each(this.collection.models,function(resultModel){
			var result = new ResultView({
				model: resultModel,
			});
			
			result.on("sendMsg",function(event) {
				self.trigger("sendMsg",event)
			})
			$(this.el).append(result.render().el);
		},this)
		return this;
	},
	});
