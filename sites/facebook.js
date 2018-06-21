console.log("facebook.js exec");

function url_to_account_id(url) {
	var regex = new RegExp('facebook\.com\/([^\?]+)');

	return url.match(regex)[1];
}

function logged_in_account_id() {
	var href = $("._2s25").first().attr("href");

	 return url_to_account_id(href);
}

function hide_friend_counts(replacement) {
	// friend counts on profile sidebar
	$("._2iem").html(replacement);

	// friend counts on profile tab
	$("._gs6").html(replacement);

	// friend counts on friends page
	$("._3d0").html(replacement);
}

function is_my_profile() {
	var account_id = logged_in_account_id();
	console.log("account_id = " + account_id);
	var reg = new RegExp('facebook\.com/' + account_id);
	return reg.test(window.location.href);
}

function modify_profile(settings) {
	console.log("on home profile");

	switch(settings.get("facebook_comment_reactions")) {
		case "nochange":

			break;
		case "nometrics":
			var others_reg = new RegExp("[0-9]+ others");
			$("._4arz").each(function(i, liketext) {
				$(liketext).html($(liketext).html().replace(others_reg, "some others"));
			});
			break;
		case "removeentirely": 
			$("._3t53").hide();
			break;
	}

	if(settings.get("facebook_hide_friend_counts")) {
		hide_friend_counts(settings.replacement);
	}
}

function modify(settings) {

	if(settings.get("facebook_enable") && is_my_profile()) {
		modify_profile(settings);
	}

	$("._gs6, ._2iem, ._3d0").css("visibility", "visible");
}

initialize_dynamic(modify);
