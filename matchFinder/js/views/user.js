var UserView = Backbone.View.extend({
	tagName: "div",
	initialize: function() {
		_.bindAll(this,"updatePage","getMatches");
		this.results = new Array();
		this.page = 1;
		this.loading = false;
		$(window).scroll(this.updatePage);
	},
    events:{
        "click .showMatch":"getMatches",
    },
	render: function() {
		$(this.el).html( this.template( this.model.toJSON() ) );
		 $('[data-spy="affix"]').each(function () {
		    	$(this).affix('refresh')
		    });
		    
		var friends = new FriendsView({model: this.model.messages});    
		this.$("#friendsListDiv").html(friends.render().el);
		
	    $('[data-spy="scroll"]').each(function () {
			var $spy = $(this).scrollspy('refresh')
		});
    		
	   // this.$('#titles').scrollspy()
    		
		return this;
	},
	updatePage: function(event,data) {
		if($(window).scrollTop() + $(window).height()  == $(document).height() && !this.loading) {
			this.loading = true;
			this.page++;
			this.getMatches(false);
		}
	},
	getMatches: function(event) {
		self = this;
		if(!this.model.results) {
			this.model.results = [];
		}
		if(!this.model.results[1]) {
			this.model.results[1] = new Results();
		}
		if(event) {
			this.model.results[1].min = ($(event.currentTarget).attr("min"));
			this.model.results[1].max = ($(event.currentTarget).attr("max"));
			$("#resultsView",self.el).empty();
			this.page = 1;
			$(window).scrollTop(0);
		}
		
		this.model.results[1].page = this.page;
		this.model.results[1].fetch({
            success: function (data) {
            	self.loading = false;
                self.resultsView = new ResultsView({
                 	collection: self.model.results[1],
                });
                
                self.listenTo(self.resultsView,"sendMsg",self.sendMessage)
                
                self.showContent("resultsView");
                $("#resultsView",self.el).append(self.resultsView.render().el);
            } 
		});
	},
	sendMessage: function(result) {
		var self = this;
		if( !this.messsageView ) {
			this.messsageView = new MessageView()
		}
		this.messsageView.model = result;
		self.showContent("messageView");
		this.$("#messageView").html(this.messsageView.render().el);
	},
	showContent: function(divName) {
		$(".userContent").hide();
		$("#"+divName).show();
	},
});