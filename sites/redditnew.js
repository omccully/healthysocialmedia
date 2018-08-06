
function posts_from_user(username) {
	$(".Post").filter(function() {
		var reddit_user = $(this).find("._2tbHP6ZydRpjI44J3syuqC.s1461iz-1.gWXVVu").text().replace("u/", "");
		return reddit_user == username;
	});
}

function hide_scores_from_user(jquery, username, replacement, allow_hover) {
	// username = wx076j-0 hPglCh
	// user link:  _2tbHP6ZydRpjI44J3syuqC s1461iz-1 gWXVVu
}

function hide_post_scores_from_user(username, replacement, allow_hover) {
	
	var user_posts = posts_from_user(username);

	// post score
	user_posts.find("._1rZYMD_4xY3gRcSS3p8ODO").html(replacement);

	// comment count
	user_posts.find(".FHCV02u6Cp2zYL0fhQPsO").html("comments");
}

function hide_comment_scores_from_user(username, replacement, allow_hover) {
	return hide_scores_from_user($(".comment"), username, replacement, allow_hover);
}

function remove_profile_karma_newreddit(replacement, allow_hover) {
	// section s7tbhgy-0 jbzdwp
	// header s7tbhgy-2 lbaGXA

	// s7tbhgy-3 fBffss
	// #profile--id-card--highlight-tooltip--karma

	if(replacement == "") {
		$(".s7tbhgy-0:contains('Karma')").hide();
	} else {
		$(".s7tbhgy-0:contains('Karma') .s7tbhgy-3").html(replacement);
	}
}

