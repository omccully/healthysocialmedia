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
	$(".Post__prominentComment > div:first-of-type:not([modified])").each(function() {
		if($(this).find(".Post__username").text() == username) {
			$(this).attr("modified", "true");

			var new_html = $(this).html().replace(new RegExp('[\-0-9]+ point[s]*'), 
				(allow_hover ? "<span title=\"$&\">" + replacement + "</span>" : replacement)
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
				metadata.attr("title", metadata.text());
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
				post_score.attr("title", post_score.text());
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

function remove_profile_karma(replacement) {
	$(".ProfileSidebar__karma").html(replacement);
}

function get_or_default(obj, key, default_value=undefined) {
  if(obj == undefined || !obj.hasOwnProperty(key)) {
    return default_value;
  }
  return obj[key];
}


function hide_bluebar_karma(replacement) {
	if(replacement != "") {
		replacement = "(" + replacement + ")";
	}
	$(".BlueBar__karma").html(replacement);
}

function hide_userspan_karma(replacement) {
	if(replacement == "") {
		//$(".user").remove(":not(a)");
		var user_link = $(".user a").first().clone();
		$(".user").empty();
		$(".user").append(user_link);

		//$(".user").find("span").remove();
		//$(".user").html($(".user").html().replace(new RegExp('(&nbsp;)|\(|\)'), ""));
	} else {
		$(".user").find(".userkarma").html(replacement).css("display", "inline");
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

function modify(settings) {
	var replacement = "HSM";
	if(get_or_default(settings, "general_leave_no_trace", false)) {
		console.log("no trace");
		replacement = "";
	} else {
		console.log("replacement = " + replacement);
	}

	var reddit_upvotes = get_or_default(settings, "reddit_upvotes", "removeentirely");
	var allow_hover = reddit_upvotes != "removeentirely";
	console.log("allow_hover = " + allow_hover);

	var user_spans = $(".user");
	if(user_spans.length == 1) {
		var logged_in_user = user_span_to_username(user_spans.first());

		hide_userspan_karma(replacement);

		var count = hide_post_scores_from_user(logged_in_user, replacement, allow_hover);
		console.log("hide_post_scores_from_user count = " + count);
		if(count > 0) {
			remove_postinfo(replacement);
		} 

		hide_comment_scores_from_user(logged_in_user, replacement, allow_hover);


		modify.seen_links = new Set(settings.get("reddit_seen_links", []));
		modify.latest_settings = settings;

		var hide_seen_links = settings.get("reddit_hide_seen_links", false);

		var opacity = "0.36"; 
		if(hide_seen_links) {
			opacity = "0.0"; // hide() videos
		}

		var unseen_urls_on_this_page = new Set();

		$(".link").each(function() {
			var permalink = $(this).attr("data-permalink");
			if(modify.seen_links.has(permalink)) {
				// shade 
				shade_link($(this), opacity);
			} else {
				unseen_urls_on_this_page.add(permalink);
			}

			//$(this).css("opacity", "0.36");
		});

		modify.unseen = unseen_urls_on_this_page;

		if($(".nav-buttons").find("#mark_links_seen").length == 0) {
			$(".nav-buttons")
				.append(
					$("<input />")
						.attr("id", "mark_links_seen")
						.attr("value", "Mark all as seen")
						.attr("type", "button")
						.css("margin-left", "15px")
						.click(function() {
							modify.unseen.forEach(function(val) {
								modify.seen_links.add(val);
							});

							chrome.storage.sync.set({
								"reddit_seen_links": Array.from(modify.seen_links)
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
							modify.seen_links.clear();

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

		//top bar
		$(".user .userkarma").css("display", "inline");
	}

	var bluebars = $(".BlueBar__username");
	if(bluebars.length == 1) {
		var username = bluebars.first().html();
		console.log("bluebar username = " + username);

		hide_bluebar_karma(replacement);
		
		hide_profile_page_overview_scores(username, replacement, allow_hover);
		hide_profile_page_comment_scores(username, replacement, allow_hover);
		hide_profile_page_post_scores(username, replacement, allow_hover);

		remove_profile_karma(replacement);

		$(".BlueBar__karma").css("display", "inline");
	}

	// make this the modified elements appear

	// profile page posts
	$(".Post__score").css("display", "block");

	// 
	$(".Comment__header .Comment__metadata").css("display", "inline-block");
	//$(".score").css("display", "inline");

	// post scores in many contexts
	$(".score").attr("modified", "true");

	// views in sidebar of your post
	$(".views").css("display", "inline");

	// profile page posts comments count
	$(".Post__flatList .Post__flatListItem:first-of-type").css("display", "inline");

	// sidebar karma on profile page
	$(".ProfileSidebar__karma").css("display", "block");
}

initialize_dynamic(modify);
