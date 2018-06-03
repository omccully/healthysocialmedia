console.log("reddit.js exec");

let Many = 5;
let Replacement = "HSM";

function user_span_to_username(user_span) {
	return $(user_span).find("a").first().html();
}

function hide_post_scores_from_user(username) {
	var num = 0;
	$(".link").each(function(i, link) {
		if($(link).attr("data-author") == username) {
			$(link).find(".score").html(Replacement).attr("title", Replacement);

			num++;
		}
	});

	return num;
}

function hide_comment_scores_from_user(username) {
	$(".comment").each(function(i, comment) {
		if($(comment).attr("data-author") == username) {
			$(comment).find(".score").html(Replacement).attr("title", Replacement);
			//$(comment).find(".score");
		}
	});

}

function hide_profile_page_overview_scores(username) {
	$(".Post__prominentComment").each(function(i, prominent) {
		var div = $(prominent).find("div").first();
		var poster = div.find(".Post__username").html();
		if(poster == username) {
			//console.log("div is " + div.type());
			div.html(div.html().replace(new RegExp('[0-9]+ point[s]*'), Replacement));
		}
	});
}

function hide_profile_page_comment_scores(username) {
	$(".Comment__header").each(function(i, header) {
		var author = $(header).find(".Comment__author").first().html();

		if(author == username) {
			var metadata = $(header).find(".Comment__metadata").first();
			metadata.html(metadata.html().replace(new RegExp('[0-9]+ point[s]*'), "[" + Replacement + "]"));
		}
	});
}

function hide_profile_page_post_scores(username) {
	$(".Post__top").each(function(i, post) {
		var author = $(post).find(".Post__authorLink").first().html();
		if(author == username) {
			$(post).find(".Post__score").html(Replacement);

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

function remove_postinfo() {
	var linkinfo = $(".linkinfo").first();
	linkinfo.find(".score").html(Replacement);
	linkinfo.find(".views").html("");

	$(".title").each(function(i, title) {
		$(title).html($(title).html().replace(new RegExp('all [0-9]+ comments'), 'all comments'));
	});
}

function remove_profile_karma() {
	$(".ProfileSidebar__karma").html(Replacement);
}

function modify() {
	var user_spans = $(".user");
	if(user_spans.length == 1) {
		var logged_in_user = user_span_to_username(user_spans.first());

		user_spans.find(".userkarma").html(Replacement);

		var count = hide_post_scores_from_user(logged_in_user);
		if(count > 0) {
			remove_postinfo();
		}

		hide_comment_scores_from_user(logged_in_user);
	}

	var bluebars = $(".BlueBar__username");
	if(bluebars.length == 1) {
		var username = bluebars.first().html();
		console.log("bluebar username = " + username);

		$(".BlueBar__karma").html("(" + Replacement + ")");

		hide_profile_page_overview_scores(username);
		hide_profile_page_comment_scores(username);
		hide_profile_page_post_scores(username);

		remove_profile_karma();
	}
}

function DOMModificationHandler(){
    $(this).unbind('DOMSubtreeModified.event1');
    setTimeout(function(){
        modify();
        $('body').bind('DOMSubtreeModified.event1',
                                   DOMModificationHandler);
    },10);
}

modify();
$('body').bind('DOMSubtreeModified.event1', DOMModificationHandler);
