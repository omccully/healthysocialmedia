console.log("reddit.js exec");

let Many = 5;
let Replacement = "HSM";

function user_span_to_username(user_span) {
	return $(user_span).find("a").first().html();
}

function hide_scores_from_user(jquery, username, replacement, allow_hover) {
	var query_result = jquery.filter("[data-author='" + $.escapeSelector(username) + "']")
		.find(".score").html(replacement);

	if(!allow_hover) {
		query_result.attr("title", replacement);
	}

	return query_result.length;
}

function hide_post_scores_from_user(username, replacement, allow_hover) {
	//if(replacement == "") replacement = "&nbsp;";
	return hide_scores_from_user($(".link"), username, replacement, allow_hover);
	
}

function hide_comment_scores_from_user(username, replacement, allow_hover) {
	return hide_scores_from_user($(".comment"), username, replacement, allow_hover);
}

function hide_profile_page_overview_scores(username, replacement, allow_hover) {
	// remove scores from comments on overview
	$(".Post__prominentComment > div:first-of-type:not([modified])").each(function() {
		if($(this).find(".Post__username").text() == username) {
			$(this).attr("modified", "true");

			var new_html = $(this).html().replace(new RegExp('[0-9]+ point[s]*'), 
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

			metadata.html(metadata.html().replace(new RegExp('[0-9]+ point[s]*'), replacement));
		}
	});
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
				var results = $(item).html().match(new RegExp('([0-9]+) comments'));
				if(results == null) return;
				if(results[1] >= Many) {
					$(item).html("many comments");
				}
			});
		}
	});
}

function remove_postinfo(replacement, allow_hover) {
	// other functions hide the upvote count

	// sidebar linkinfo
	var linkinfo = $(".linkinfo").first();
	linkinfo.find(".score").html(replacement);
	linkinfo.find(".views").html("");

	// comment count
	$(".title").each(function(i, title) {
		$(title).html($(title).html().replace(new RegExp('all [0-9]+ comments'), 'all comments'));
	});
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
		$(".user").find(".userkarma").html(replacement);
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
		if(count > 0) {
			remove_postinfo();
		}

		hide_comment_scores_from_user(logged_in_user, replacement, allow_hover);
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
	}
}

initialize_dynamic(modify);
