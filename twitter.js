console.log("twitter.js exec");

var username = $(".DashUserDropdown-userInfo").first().find(".username").first().find("b").first().html();

console.log("username = " + username);

// todo: redo script when new tweets are loaded. 

$(".content").each(function(i, tweet) {
	var poster = $(tweet).find(".username").first().find("b").first().html();

	if(username == poster || poster == "ZeitgeistFilm") {
		$(tweet).find(".ProfileTweet-actionCountForPresentation").html("HSM");
	}
});

var reg = new RegExp('twitter\.com/' + username);
var match = reg.test(window.location.href);
if(match) {
	$(".ProfileNav-stat").each(function(i, stat) {
		console.log("stat " + i + " " + stat + " nav=" + $(stat).attr("data-nav"));
		if($(stat).attr("data-nav") == "followers") {
			
			$(stat).find(".ProfileNav-value").first().html("HSM");
		}
	});
}


