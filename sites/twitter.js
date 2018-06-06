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
	
	$(".content").each(function(i, tweet) {
		var poster = $(tweet).find(".username b").text();

		if(username == poster) {
			$(tweet).find(".ProfileTweet-actionCountForPresentation").html("HSM");

			for(var key in setting2selector) {
				if(setting2selector.hasOwnProperty(key)) {
					if(settings.get(key)) {
						$(setting2selector[key] + selector_appendix).hide(); //.html("hid favorite");
					}
				}
			}
		}
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

function modify(settings) {
	var username = logged_in_user();

	console.log("username = " + username);

	var replacement = settings.replacement;
	var twitter_followers_allow_hover = settings.twitter_followers_allow_hover;

	remove_tweet_stats(username, settings);
	remove_profile_followers(username, replacement, twitter_followers_allow_hover);
	remove_statcard_followers(replacement, twitter_followers_allow_hover);

	remove_useless_notifications(settings);
}

initialize_dynamic(modify);
