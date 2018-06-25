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
	$("DashboardProfileCard .ProfileCardStats-statLink[data-element-term='follower_stats']").each(function(i, stat) {
		if(replacement == "") {
			$(stat).hide().attr("hsm-hidden", "true");
		} else if(!allow_hover) {
			$(stat).attr("data-original-title", replacement);
		}
	
		$(stat).find(".ProfileCardStats-statValue").html(replacement);
	});
}



var UselessNotificationSelectors = {
	'twitter_hide_like_notifications': "li.js-activity-favorite",
	'twitter_hide_retweet_notifications': "li.js-activity-retweet",
	'twitter_hide_follow_notifications': "li.js-activity-follow",
	'twitter_hide_likemention_notifications': "li.js-activity-favorited_mention"
};

function hidden_notification_selector(settings) {
	var selectors = [];
	for(var key in UselessNotificationSelectors) {
		if(UselessNotificationSelectors.hasOwnProperty(key)) {
			if(settings.get(key)) {
				selectors.push(UselessNotificationSelectors[key]);
			}
		}
	}
	if(selectors.length == 0) return ".gfjadgsdgjo";
	return selectors.join(", ");
}

function remove_useless_notifications(settings) {
	for(var key in UselessNotificationSelectors) {
		if(UselessNotificationSelectors.hasOwnProperty(key)) {
			if(settings.get(key)) {
				$(UselessNotificationSelectors[key]).hide(); 
			} else {
				$(UselessNotificationSelectors[key]).show(); 
			}
		}
	}
}

function new_notifications_count() {
	var ele = $("li.notifications .count").first();
	if(!ele || ele.length == 0) return 0;
	if(!ele.is(".new-count")) return 0;
	return parseInt(ele.text());
}

function is_notifications_page() {
	return window.location.href.includes("i/notifications");
}

function modify_notification_icon(settings) {
	var stored_notification_count = settings.get("twitter_notification_count", 0);
	console.log("stored_notification_count = " + stored_notification_count);

	if(is_notifications_page()) {
		if(stored_notification_count > 0) {
			// highlight the first stored_notification_count shown notifications
			$(".js-activity:not(" + hidden_notification_selector(settings) + ")")
				.slice(0, stored_notification_count).addClass("highlighted");
			
			chrome.storage.sync.set({ "twitter_notification_count": 0 });
			settings.set_val("twitter_notification_count", 0);
			$("li.notifications #hsm-ncount").css("display", "none").removeClass("new-count");
		}
	} else {
		if(stored_notification_count > 0) {
			if($("li.notifications #hsm-ncount.count").length == 0) {
				$("li.notifications a").append(
					$("<span></span>").attr("id", "hsm-ncount")
					.attr("class", "count new-count").css("display", "block").append(
						$("<span></span>").attr("class", "count-inner").html(stored_notification_count)
					)
				)
			} else {
				$("li.notifications #hsm-ncount").css("display", "block")
					.addClass("new-count").find(".count-inner").html(stored_notification_count);
			}
		} else {
			$("li.notifications #hsm-ncount").css("display", "none").removeClass("new-count");
		}

		var new_nc = new_notifications_count();
		console.log("new_nc = " + new_nc);
		if(new_nc > 0) {
			// prevent this from being queried multiple times
			if(!modify_notification_icon.last_query_time || 
				(Date.now() - modify_notification_icon.last_query_time) > 10000) {
				console.log("querying...");
				// check what the notificiations are...
				$.ajax({
					type: "GET",
					url: "/i/notifications",
					success: function(msg) {
						var new_shown_notification_count = $(msg).find(".js-activity.highlighted:not(" + 
							hidden_notification_selector(settings) + ")").length;
						console.log("new_shown_notification_count = " + new_shown_notification_count);
						// add new_shown_notification_count with settings.get("twitter_notification_count", 0)
						var new_stored_notification_count = new_shown_notification_count + stored_notification_count;
						console.log("new_stored_notification_count = " + new_stored_notification_count);
						chrome.storage.sync.set({"twitter_notification_count": new_stored_notification_count});
					}
				});
				modify_notification_icon.last_query_time = Date.now();
			}
		}
	}
}

function modify(settings) {
	if(settings.get("twitter_enable")) {
		var username = logged_in_user();

		console.log("username = " + username);

		var replacement = settings.replacement;
		var followers_allow_hover = settings.twitter_followers_allow_hover;
		var modify_followers = settings.twitter_modify_followers;

		remove_tweet_stats(username, settings);

		if(modify_followers) {
			remove_profile_followers(username, replacement, followers_allow_hover);
			remove_statcard_followers(replacement, followers_allow_hover);
		}
		
		remove_useless_notifications(settings);

		if(settings.get("twitter_exclude_hidden_notifications")) 
		{
			modify_notification_icon(settings);
		}
	}
	
	// home page followers
	$(".ProfileCardStats-statLink[data-element-term='follower_stats']:not([hsm-hidden='true'])")
		.css("visibility", "visible");

	// profile page followers
	$(".ProfileNav-stat[data-nav='followers']").css("visibility", "visible");

	// tweet stats
	$(".ProfileTweet-actionCountForPresentation").css("visibility", "visible");

	// selected tweet stats
	$(".js-tweet-stats-container").attr("hsm-modified", "true");
}

initialize_dynamic(modify);
