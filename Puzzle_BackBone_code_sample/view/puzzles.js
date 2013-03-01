PuzzlesView = Backbone.View.extend({
		initialize: function() {
			
		},
		events: {
			"click .puzzlePreview" : "openPuzzle",
		},
		openPuzzle: function(event) {
			var selectedId = event.target.id;
			selectedPuzzle = this.model.where({puzzle_name: event.target.id})[0];
			puzzle.navigate("solve/"+event.target.id, {trigger: true});
		},
		render: function() {
			console.log("render PuzzlesViews");
			$(this.el).html( this.template({puzzles: this.model.toJSON()}) );
			return this;
		}
		
});