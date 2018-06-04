console.log("twitter.js exec");

// todo: redo script when new tweets are loaded. 

function logged_in_user() {
	return $(".DashUserDropdown-userInfo").first().find(".username").first().find("b").first().html();
}

function remove_tweet_stats(username) {
	$(".content").each(function(i, tweet) {
		var poster = $(tweet).find(".username").first().find("b").first().html();

		if(username == poster) {
			$(tweet).find(".ProfileTweet-actionCountForPresentation").html("HSM");
		}
	});
}

function remove_profile_followers(username) {
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
}

function remove_statcard_followers() {
	$(".ProfileCardStats-statLink").each(function(i, stat) {
		$(stat).attr("data-original-title", "HSM");

		if($(stat).attr("data-element-term") == "follower_stats") {
			$(stat).find(".ProfileCardStats-statValue").html("HSM");
		}
	});
}

function remove_useless_notifications() {
	$("li.js-activity-favorite").hide(); //.html("hid favorite");
	$("li.js-activity-retweet").hide(); //.html("hid retweet");
	$("li.js-activity-follow").hide(); //.html("hid follow");

}

function modify() {
	var username = logged_in_user();

	console.log("username = " + username);

	remove_tweet_stats(username);
	remove_profile_followers(username);
	remove_statcard_followers();

	remove_useless_notifications();
}


function DOMModificationHandler(){
    $(this).unbind('DOMSubtreeModified.event1');
    setTimeout(function(){
        modify();
        $('#timeline').bind('DOMSubtreeModified.event1',
                                   DOMModificationHandler);
    },10);
}


$('#timeline').bind('DOMSubtreeModified.event1', DOMModificationHandler);
modify();
