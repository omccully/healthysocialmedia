console.log("reddit.js exec");

let Many = 5;
let Replacement = "HSM";

function user_span_to_username(user_span) {
	return $(user_span).find("a").first().html();
}

function hide_scores_from_user(jquery, username, replacement, allow_hover) {

	var posts = jquery.filter("[data-author='" + $.escapeSelector(username) + "']");
	var query_result = posts.find(".score").html(replacement);

	if(!allow_hover) {
		query_result.attr("title", replacement);
	}

	if(replacement && jquery.length < 10) {
		// only do this on your post pages
		posts.find(".midcol").css("width", "5.1ex");
	}
	

	return query_result.length;
}

function hide_post_scores_from_user(username, replacement, allow_hover) {
	//if(replacement == "") replacement = "&nbsp;";
	hide_post_comment_counts(username);
	return hide_scores_from_user($(".link"), username, replacement /*.substring(0, 1)*/, allow_hover);
	
}

function hide_comment_scores_from_user(username, replacement, allow_hover) {
	return hide_scores_from_user($(".comment"), username, replacement, allow_hover);
}

function hide_post_comment_counts(username) {
	var query_result = $(".link[data-author='" + $.escapeSelector(username) + "'] .flat-list .first a.comments")
		.each(function() {
			var new_txt = modify_comments_text($(this).html(), Many);
			if(new_txt != null) $(this).html(new_txt);
		});
}

function hide_profile_page_overview_scores(username, replacement, allow_hover) {
	// remove scores from comments on overview
	// :not([modified])
	$(".Post__prominentComment > div:first-of-type").each(function() {
		//$(this).attr("modified", "true");]
		console.log("span hover already created = " + $(this).has("span#hoverpoints"));
		if($(this).find(".Post__username").text() == username && !$(this).has("span#hoverpoints")) {
			var new_html = $(this).html().replace(new RegExp('[\-0-9]+ point[s]*'), 
				(allow_hover ? "<span id=\"hoverpoints\" title=\"$&\">" + replacement + "</span>" : replacement)
			);
			if(replacement == "") new_html = new_html.replace("•", "");

			$(this).html(new_html);
		}
	});
}

function hide_profile_page_comment_scores(username, replacement, allow_hover) {
	if(replacement != "") {
		replacement = "[" + replacement + "]";
	}

	$(".Comment__header").each(function(i, header) {
		var author = $(header).find(".Comment__author").first().html();

		if(author == username) {
			var metadata = $(header).find(".Comment__metadata").first();
			if(allow_hover) {
				if(metadata.attr("hovered") != "true") {
					metadata.attr("title", metadata.text());
					metadata.attr("hovered", "true");
				}
				
			}

			metadata.html(metadata.html().replace(new RegExp('[\-0-9]+ point[s]*'), replacement));
		}
	});
}

function modify_comments_text(comments_txt, many) {
	var results = comments_txt.match(new RegExp('([0-9]+) comments'));
	if(results == null) return null;
	if(results[1] >= Many) {
		return "many comments";
	}
	return null;
}

function hide_profile_page_post_scores(username, replacement, allow_hover) {
	//if(replacement == "") replacement = "&nbsp;";

	$(".Post__top").each(function(i, post) {
		var author = $(post).find(".Post__authorLink").first().html();
		if(author == username) {
			var post_score = $(post).find(".Post__score");

			if(allow_hover) {
				if(post_score.text() != replacement) {
					post_score.attr("title", post_score.text());
				}
			}

			post_score.html(replacement);

			$(post).find(".Post__flatListItem").each(function(j, item) {
				var new_txt = modify_comments_text($(item).html(), Many);
				if(new_txt != null) $(item).html(new_txt);
			});
		}
	});
}

function remove_postinfo(replacement) {
	// other functions hide the upvote count

	// sidebar linkinfo
	var linkinfo = $(".linkinfo").first();
	linkinfo.find(".score").html(replacement);
	linkinfo.find(".views").html("");


	// comment count
	$(".title").each(function(i, title) {
		$(title).html($(title).html().replace(new RegExp('all [0-9]+ comments'), 'all comments'));
	});

	//$(".flat-list .first a.comments").html("comments");
}

function remove_profile_karma(replacement, allow_hover) {
	if(allow_hover) {
		var html = $(".ProfileSidebar__karma").text();
		if(html != replacement) {
			// prevent replacing karma with the replacement on 2nd time through
			$(".ProfileSidebar__karma").attr("title", html);
		}
	}
	$(".ProfileSidebar__karma").html(replacement);
}

function get_or_default(obj, key, default_value=undefined) {
  if(obj == undefined || !obj.hasOwnProperty(key)) {
    return default_value;
  }
  return obj[key];
}


function hide_bluebar_karma(replacement, allow_hover) {
	if(replacement != "") {
		replacement = "(" + replacement + ")";
	}

	if(allow_hover) {
		var html = $(".BlueBar__karma").text();
		if(html != replacement) {
			$(".BlueBar__karma").attr("title", 
				html.replace("(", "").replace(")", "").replace(new RegExp('a([0-9])', "g"), "a; $1"));
		}
	}

	$(".BlueBar__karma").html(replacement);
}

function hide_userspan_karma(replacement, allow_hover) {
	if(replacement == "") {
		//$(".user").remove(":not(a)");
		var user_link = $(".user a").first().clone();
		$(".user").empty();
		$(".user").append(user_link);

		//$(".user").find("span").remove();
		//$(".user").html($(".user").html().replace(new RegExp('(&nbsp;)|\(|\)'), ""));
	} else {
		var karma_ele = $(".user").find(".userkarma");
		if(allow_hover && karma_ele.text() != replacement) karma_ele.attr("title", karma_ele.text());

		karma_ele.html(replacement).css("display", "inline");
	}
}



function shade_link(jquery, opacity) {
	if(parseFloat(opacity) == 0.0) {
		jquery.hide();
	} else {
		jquery.css("opacity", opacity);
		jquery.show();
	}
}

function is_channel_page_by_chid(channel_id) {
	if(!channel_id) return false;
	return window.location.href.includes("channel/" + channel_id);
}


function is_profile(username) {
	if(!username) return false;
	return window.location.href.toLowerCase().includes("user/" + username.toLowerCase());
}

function is_comments_page() {
	return window.location.href.match(new RegExp('r\/[A-Za-z_-]+\/comments'));
}

function modify_seen_posts(settings) {

	modify_seen_posts.seen_links = new Set(settings.get("reddit_seen_links", []));
	modify_seen_posts.latest_settings = settings;

	var hide_seen_links = settings.get("reddit_hide_seen_links", false);

	var opacity = "0.36"; 
	if(hide_seen_links) {
		opacity = "0.0"; // hide() videos
	}

	var unseen_urls_on_this_page = new Set();
	if(!is_comments_page()) {
		$(".link").each(function() {
			var permalink = $(this).attr("data-permalink");
			if(modify_seen_posts.seen_links.has(permalink)) {
				// shade 
				shade_link($(this), opacity);
			} else {
				unseen_urls_on_this_page.add(permalink);
			}

			//$(this).css("opacity", "0.36");
		});
	}
	modify_seen_posts.unseen = unseen_urls_on_this_page;
	

	if($(".nav-buttons").find("#mark_links_seen").length == 0) {
		$(".nav-buttons")
			.append(
				$("<input />")
					.attr("id", "mark_links_seen")
					.attr("value", "Mark all as seen")
					.attr("type", "button")
					.css("margin-left", "15px")
					.click(function() {
						modify_seen_posts.unseen.forEach(function(val) {
							modify_seen_posts.seen_links.add(val);
						});

						chrome.storage.sync.set({
							"reddit_seen_links": Array.from(modify_seen_posts.seen_links)
						});

						shade_link($(".link"), opacity);
					})
			).append(
				$("<input />")
					.attr("id", "mark_links_unseen")
					.attr("value", "Mark all as unseen")
					.attr("type", "button")
					.css("margin-left", "15px")
					.click(function() {
						modify_seen_posts.seen_links.clear();

						chrome.storage.sync.set({"reddit_seen_links": []});

						shade_link($(".link"), "");
					})
			).append(
				$("<input />")
					.attr("id", "hide_seen_links")
					.attr("type", "checkbox")
					.prop("checked", hide_seen_links)
					.css("margin-left", "15px")
					.css("vertical-align", "middle")
					.change(function() {
						
						var checked = $(this).prop("checked");
						console.log("checked = " + checked);
						chrome.storage.sync.set({"reddit_hide_seen_links": checked});

						// use this static value because "settings" could be old
						modify.latest_settings.set_val("reddit_hide_seen_links", checked);
						modify(modify.latest_settings);
					})
			).append(
				$("<label></label>")
					.attr("for", "hide_seen_links")
					.html("Hide seen links")
			);
	}
}

function modify(settings) {
	if(settings.get("reddit_enable")) {
		var replacement = settings.replacement;

		//var reddit_upvotes = get_or_default(settings, "reddit_upvotes", "removeentirely");
		var upvotes_allow_hover = settings.reddit_upvotes_allow_hover;
		var modify_upvotes = settings.reddit_modify_upvotes;
		console.log("upvotes_allow_hover = " + upvotes_allow_hover);

		var karma_allow_hover = settings.reddit_karma_allow_hover;
		var modify_karma = settings.reddit_modify_karma;
		console.log("karma_allow_hover = " + karma_allow_hover);


		var user_spans = $(".user");
		if(user_spans.length == 1) {
			var logged_in_user = user_span_to_username(user_spans.first());

			if(modify_karma) hide_userspan_karma(replacement, karma_allow_hover);

			if(modify_upvotes) {
				var count = hide_post_scores_from_user(logged_in_user, replacement, upvotes_allow_hover);
				console.log("hide_post_scores_from_user count = " + count);
				if(count > 0) {
					remove_postinfo(replacement);
				} 

				hide_comment_scores_from_user(logged_in_user, replacement, upvotes_allow_hover);
			}
			
			modify_seen_posts(settings);

			//top bar
			$(".user .userkarma").css("display", "inline");
		}

		var bluebars = $(".BlueBar__username");
		if(bluebars.length == 1) {
			var username = bluebars.first().html();
			console.log("bluebar username = " + username);

			if(modify_karma) hide_bluebar_karma(replacement, karma_allow_hover);
			
			if(is_profile(username)) {
				if(modify_upvotes) {
					hide_profile_page_overview_scores(username, replacement, upvotes_allow_hover);
					hide_profile_page_comment_scores(username, replacement, upvotes_allow_hover);
					hide_profile_page_post_scores(username, replacement, upvotes_allow_hover);
				}
				
				if(modify_karma) remove_profile_karma(replacement, karma_allow_hover);
			}

			$(".BlueBar__karma").css("display", "inline");
		}
	}
	

	// top line of prominent comment on profile overview.
	$(".Post__prominentComment > div:first-of-type").css("visibility", "visible");

	// profile page posts
	$(".Post__score").css("visibility", "visible");

	// 
	$(".Comment__header .Comment__metadata").css("display", "inline-block");
	//$(".score").css("display", "inline");

	// post scores in many contexts
	$(".score").attr("modified", "true").css("visibility", "visible");

	// views in sidebar of your post
	$(".views").css("display", "inline");

	// profile page posts comments count
	$(".Post__flatList .Post__flatListItem:first-of-type").css("display", "inline");

	// sidebar karma on profile page
	$(".ProfileSidebar__karma").css("display", "block");
}

initialize_dynamic(modify);
