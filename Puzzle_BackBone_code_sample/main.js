var Puzzle = Backbone.Router.extend({
	routes : {
		"": "goHome",
		"solve/:id": "solvePuzzle",
	},
	initialize: function() {
		var self = this;
		mainUser = new UserModel();
		console.log("strat friendspuzzle");
		if(typeof(headerView) == "undefined") {
			headerView = new HeaderView({ el: $("#headerDiv")});
			headerView.render();
		}
		
	},
	solvePuzzle: function(id) {
		console.log("solve puzzle" + id);
		if(typeof(solveView) == "undefined") {
			solveView = new SolveView({el: $("#mainDiv")});
		}
		if(typeof(selectedPuzzle) == 'undefined') {
			selectedPuzzle = new PuzzleModel({id: id});
			selectedPuzzle.fetch({success: function() {
				solveView.model = selectedPuzzle;
				solveView.render();
			}, error: function() {console.log('error');}});
		} else {
		solveView.model = selectedPuzzle;
		solveView.render();
		}
	},
	goHome: function() {
		console.log("gohome");
		
		puzzleCollection = new PuzzleCollection();
		puzzleCollection.fetch({
			success: function() {
				console.log("success");
				puzzlesView = new PuzzlesView({model:puzzleCollection, el:$("#mainDiv")});
				puzzlesView.render(); 
			},
			error: function() {
				console.log("error");
			}
		});
		
	}
});

templateLoader.load(["HeaderView", "PuzzlesView", "SolveView"],
    function () {
        console.log("start");
		puzzle = new Puzzle();
		Backbone.history.start();
    });
