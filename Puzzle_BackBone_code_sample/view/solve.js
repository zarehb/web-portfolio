var SolveView = Backbone.View.extend({
	initialize: function() {
	},
	events: {
		"click .mixPuzzle": "shufflePuzzle",
		"load #puzzleImg": "createPuzzle",
		"click .puzzleCell": "puzzleCellClicked",
		"hover .puzzleCell": "puzzleCellOver",
		"click #startBtn": "startSolve",
		"click #changeLevel": "resetPuzzle",
		"click #repeat": "startSolve",
		"click #continue": "nextLevel",
		"click #back": "back",
	},
	nextLevel: function() {
		console.log('next Level');
		this.difficulty = Math.min(this.difficulty+2,12);
		this.$('#nextStepModel').modal('hide',{silent:true});
		this.shuffleLevelBased(this.difficulty);
		this.startSolve();
	},
	back: function() {
		puzzle.navigate("",{trigger: true});
		this.$('#nextStepModel').modal('hide');
	},
	updateResult: function() {
		console.log('update result');
		if(this.$('#moves').length == 0) {
			clearInterval(this.timer);
		}
		this.$('#moves').html(this.result.get('moves'));
		this.$('#time').html(this.result.get('time')+' s');
	},
	similarPuzzles: function() {
		/*
		var self = this;
		var puzzles = new PuzzleCollection();
		puzzles.originalPuzzle = selectedPuzzle;
		puzzles.fetch({success: function(self.showPuzzles(puzzles))});
		*/
	},
	showPuzzles: function(puzzles) {
		console.log(JSON.stringify(puzzles));
	},
	resetPuzzle: function() {
		this.started = false;
		this.selected = null;
		this.result.clear({silent:true});
		this.result.set({moves:0,time:0},{silent:true});
		this.shuffleLevelBased(this.difficulty);
		clearInterval(this.timer);
		this.$("#buttonsBar").show("fold");
		this.$("#infoBar").hide("fold");
	},
	render: function() {
		console.log("render SolveView");
		var self = this;
		this.result = new ResultModel();
		$(this.el).html( this.template(this.model.toJSON()) );
		
		this.$("#infoBar").hide();
		this.$("#puzzleImg").one('load', function() {
								self.createPuzzle($(this).width(),$(this).height()) ;
							}).each(function() {
								  if(this.complete) $(this).load();
							});
		self.$('#loadingModal').on('hide',function() {self.shareOnFacebook(); self.result.clear(); self.$('#nextStepModel').modal('show',{backdrop:true,keyboard:false})})
		this.animDone = true;
		this.started = false;
		this.difficulty = 4;
		this.listenTo(this.result,"change",this.updateResult);
		return this;
	},
	shareOnFacebook: function() {
		var self = this;
		FB.ui(
		  {
		    method: 'feed',
		    name: 'namename',
		    link: 'http://http://localhost:8888/puzzleBackbone/#solve/1523523077_1352181443875',
		    picture: 'http://fbrell.com/f8.jpg',
		    caption: 'Click to solve',
		    description: 'I have solved this puzzle in ' + self.result.time + ' seconds' ,
		  },
		  function(response) {
		    if (response && response.post_id) {
		      alert('Post was published.');
		    } else {
		      alert('Post was not published.');
		    }
		  }
		);
	},
	startSolve: function() {
		var self = this;
		this.shuffleLevelBased(this.difficulty);
		this.$('#difficulty').html(this.difficulty/2);
		this.started = true;
		this.solved = false;
		this.$('.puzzleCell').addClass('hasShadow');
		
		this.selected = null;
		this.result.set({moves:0,time:0});
		this.$("#buttonsBar").hide("fold");
		this.$("#infoBar").show("fold");
		clearInterval(this.timer);
		this.timer = setInterval(function() {self.result.set({time: self.result.get('time')+1})},1000);
	},
	puzzleSolved: function() {
		var self = this;
		this.endTime = new Date().getTime();
		clearInterval(this.timer);
		mainUser.getStatus();
		this.listenTo(mainUser,'ready',this.saveResult);
		this.listenTo(mainUser,'fail',function() { self.$('#loadingModal').modal('hide'); });
		this.showLoading();
	},
	
	saveResult: function(model) {
		console.log('save result');
		var self = this;
		this.result.save({level:this.difficulty,puzzleId: this.model.get('puzzle_name'), time:(this.endTime - this.startTime)/1000},{success:function() {self.getRankings()}});
	},
	getRankings: function () {
		
	},
	showLoading: function () {
	  $('#loadingModal').modal('show');
	},
	autoSolve: function() {
		var self = this;
		$(".puzzleCell").each(function() {
			if($(this).attr('key') != $(this).attr('data-role')) {
				var curPos = $(this).attr("data-role");
				self.swapPuzzleCells($(this),$('.puzzleCell[key="'+curPos+'"]'),false,false);
			}
		});
	},
	shufflePuzzle: function (event) {
		this.$("#buttonsBar .active").removeClass("active");
		$(event.currentTarget).parent().addClass("active");
		this.difficulty = $(event.currentTarget).attr('data-role');
		this.autoSolve();
		this.shuffleLevelBased(this.difficulty);
		return false;
	},
	shuffleLevelBased: function(difficulty) {
		if(typeof(difficulty) == 'undefined') {
			difficulty=this.difficulty = 4;
		}
		this.autoSolve();
		var shuffledKeys = [];
		
		for(var i = 0 ; i < difficulty; i++) {
			console.log("start")
			do {
				var firstCell = (Math.ceil((Math.random()*25)));
				var secondCell = (Math.ceil((Math.random()*25)));
				//console.log(firstCell,secondCell)
			} while(firstCell == secondCell || $.inArray(firstCell, shuffledKeys)!=-1 || $.inArray(secondCell, shuffledKeys)!=-1);
	
			shuffledKeys.push(firstCell);
			shuffledKeys.push(secondCell);
	
			this.swapPuzzleCells($($(".puzzleCell").get(firstCell)),$($(".puzzleCell").get(secondCell)),false,false);
		}
	},
	checkForSolve: function() {
		var solved = true;
		$(".puzzleCell").each(function() {
			if($(this).attr('key') != $(this).attr('data-role')) {
				solved =  false;
			}
		})
		this.solved = solved;
		if(this.solved) {
			this.$('.puzzleCell').removeClass('hasShadow');
			this.started = false;
			this.$('.rollOverCorrect').removeClass('rollOverCorrect');
			this.$('.rollOverCorrect').removeClass('rollOverWrong');
		}
		return solved;
	},
	createPuzzle: function (width,height) {
		var key = this.model.get("puzzle_key");
		var keys = key.split(",");
			
		var puzzleContainer = $("#puzzleContainer");
		puzzleContainer.width(width);
		puzzleContainer.append("");
		for(i = 0 ; i < 5 ; i ++) {
			for(j = 0 ; j < 5 ; j ++) {
				puzzleContainer.append("<div key='" +  keys[i*5 + j] + "' data-role='"+ i + ":" + j + "' style='background-position:" + -i*width/5 + "px " + -j*height/5 + "px; left:" + i*width/5 + "px; top:" + j*height/5 + "px;' class='puzzleCell hasShadow'></div>");
				}
			}
		$(".puzzleCell").width(width/5);
		$(".puzzleCell").height(height/5);
		$(".puzzleCell").css('background-image','url('+ this.model.get("puzzle_url")  +')');
		this.shuffleLevelBased(this.difficulty);
	},
	puzzleCellOver: function(event) {
		if(!this.animDone || !this.started) {
			return;
		}
		if(this.activeCell) {
			$(this.activeCell).removeClass('rollOverCorrect');
			$(this.activeCell).removeClass('rollOverWrong');
		}
		this.activeCell = $(event.currentTarget);
		var correct = (this.activeCell.attr('key') == this.activeCell.attr('data-role'));
		
		$(event.currentTarget).addClass(correct ? 'rollOverCorrect' : 'rollOverWrong');
	},
	puzzleCellClicked: function(event) {
		if(!this.animDone || !this.started) {
			return;
		}
		console.log('swap');
		if(this.selected)
		{
			this.selected.removeClass('selected');
			if(this.selected == $(event.currentTarget)) {
				this.selected = null;
				return;
			}
			this.swapPuzzleCells($(event.currentTarget),this.selected);
			this.selected = null;
		}
		else
		{
			this.selected = $(event.currentTarget);
			this.selected.addClass('selected');
		}
	},
	swapPuzzleCells: function (firstCell,secondCell,checkForSolveParam ,animated) {
		var self = this;
		if( animated ) {
			this.animDone = false;
		}
		this.result.set({'moves':this.result.get('moves')+1});
		var checkForSolveParam = typeof checkForSolveParam !== 'undefined' ? checkForSolveParam : true;

		var animated = typeof animated !== 'undefined' ? checkForSolveParam : true;
		   
		var tempPosition = secondCell.attr('data-role');
		secondCell.attr('data-role',firstCell.attr('data-role'));
		firstCell.attr('data-role',tempPosition);

		var firstLeft = firstCell.css("left");
		var firstTop = firstCell.css("top");
		
		if(!animated) {
			firstCell.css("left",secondCell.css("left"));
			firstCell.css("top",secondCell.css("top"));
			secondCell.css("left",firstLeft);
			secondCell.css("top",firstTop);
			return;
		}
		
		if(!this.startTime) {
				this.startTime = new Date().getTime();
		}
		firstCell.animate({
						left: secondCell.position().left,
						top: secondCell.position().top,
			
						},300,function() {
							this.animDone = true;
							if(checkForSolveParam && self.checkForSolve()) {
								self.puzzleSolved();
							}
						});
		$(secondCell).animate({
			left: firstLeft,
			top: firstTop,
			},300);
		},
	
})
