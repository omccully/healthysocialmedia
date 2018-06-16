console.log("twitter.js exec");

function logged_in_user() {
	return $(".DashUserDropdown-userInfo .username b").first().text();
}

function remove_tweet_stats(username, settings) {
	var setting2selector = {
		'twitter_hide_tweet_likes': "button.js-actionFavorite",
		'twitter_hide_tweet_retweet': "button.js-actionRetweet",
		'twitter_hide_tweet_comments': "button.js-actionReply"
	};
	var selector_appendix = " .ProfileTweet-actionCountForPresentation";

	var replacement = settings.replacement;
	
	$(".tweet").each(function() {
		var poster = $(this).attr("data-screen-name"); //$(tweet).find(".username b").text();

		if(username == poster) {
			//$(tweet).find(".ProfileTweet-actionCountForPresentation").html("HSM");

			for(var key in setting2selector) {
				if(setting2selector.hasOwnProperty(key)) {
					if(settings.get(key)) {
						var ele = $(this).find(setting2selector[key] + selector_appendix);
						ele.html(replacement);
						if(!replacement) ele.hide();
					}
				}
			}

			var hide_retweets = settings.get("twitter_hide_tweet_retweet");
			var hide_likes = settings.get("twitter_hide_tweet_likes");
			
			if(hide_retweets) $(this).find(".js-stat-retweets").hide();
			if(hide_likes) $(this).find(".js-stat-favorites").hide();
			
			if(hide_retweets && hide_likes) {
				// if both hidden, remove the whole damn row
				$(".js-tweet-stats-container").hide();
			} else if(hide_retweets || hide_likes) {
				// if either hidden, remove avatars
				$(this).find(".avatar-row").css("visibility", "hidden");
			}
		}
	});
}

function remove_tweet_stats_selected(username, settings) {
	$(".tweet").each(function() {

	});
}

function remove_profile_followers(username, replacement, allow_hover) {
	var reg = new RegExp('twitter\.com/' + username);
	var match = reg.test(window.location.href);
	if(match) {
		if(replacement == "") {
			$(".ProfileNav-stat[data-nav='followers']").hide();
		} else {
			var parent = $(".ProfileNav-stat[data-nav='followers']");
			if(!allow_hover) {
				parent.attr("data-original-title", replacement);
			}

			parent.find(".ProfileNav-value").html(replacement);
		}
	}
}

function remove_statcard_followers(replacement, allow_hover) {
	$(".ProfileCardStats-statLink[data-element-term='follower_stats']").each(function(i, stat) {
		if(replacement == "") {
			$(stat).hide();
		} else {
			if(!allow_hover) {
				$(stat).attr("data-original-title", replacement);
			}
			
			$(stat).find(".ProfileCardStats-statValue").html(replacement);
		}
	});
}

function remove_useless_notifications(settings) {
	var setting2selector = {
		'twitter_hide_like_notifications': "li.js-activity-favorite",
		'twitter_hide_retweet_notifications': "li.js-activity-retweet",
		'twitter_hide_follow_notifications': "li.js-activity-follow"
	};

	for(var key in setting2selector) {
		if(setting2selector.hasOwnProperty(key)) {
			if(settings.get(key)) {
				$(setting2selector[key]).hide(); 
			}
		}
	}
}

function notifications() {
	var ele = $("li.notifications .new-count .count-inner").first();
	if(!ele) return 0;
	return parseInt(ele.text());
}

function modify(settings) {
	var username = logged_in_user();

	console.log("username = " + username);

	var replacement = settings.replacement;
	var twitter_followers_allow_hover = settings.twitter_followers_allow_hover;

	remove_tweet_stats(username, settings);
	remove_profile_followers(username, replacement, twitter_followers_allow_hover);
	remove_statcard_followers(replacement, twitter_followers_allow_hover);

	remove_useless_notifications(settings);

	// home page followers
	$(".ProfileCardStats-statLink[data-element-term='follower_stats']").css("visibility", "visible");

	// profile page followers
	$(".ProfileNav-stat[data-nav='followers']").css("visibility", "visible");

	// tweet stats
	$(".ProfileTweet-actionCountForPresentation").css("visibility", "visible");

	// selected tweet stats
	$(".js-tweet-stats-container").attr("hsm-modified", "true");
}


/*
$.ajax({
	type: "GET",
	url: "/i/notifications",
	success: function(msg) {
		$(msg).find(".js-activity:not(.highlighted)").each(function(i) {
			console.log(i + " " + $(this).prop("tagName") + " " + $(this).attr("class"));
		})
	}
});
*/

initialize_dynamic(modify);
