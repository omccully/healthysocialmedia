console.log("youtube.js exec");

function get_channel_id_from_dom() {
	var regex = new RegExp('\/channel\/([^?]+)');
	var channel_id = null;

	$("iron-dropdown .ytd-compact-link-renderer").each(function(i, endpoint) {
		var href = $(endpoint).attr("href");
		// TODO: this loops like 80 times
		if(href != null) {
			var match = href.match(regex);
			if(match != null) {
				channel_id = match[1];
			}
		}
	});

	return channel_id;
}

// youtube channel ID isn't always available in the DOM, so we need to cache it
function get_latest_channel_id(settings) {
	// prefer DOM, static value, then storage
	var chid_cache_key = 'cache_youtube_channel_id';

	var channel_id = get_channel_id_from_dom();
	if(channel_id != null) {
		chrome.storage.sync.set({[chid_cache_key]: channel_id}, function() {
			console.log("Stored " + chid_cache_key + " = " + channel_id);
		});
		get_latest_channel_id.latest_channel_id = channel_id;
		return channel_id;
	} else if(get_latest_channel_id.latest_channel_id != undefined) {
		return get_latest_channel_id.latest_channel_id;
	} 
	var chid = settings.get(chid_cache_key);
	get_latest_channel_id.latest_channel_id = chid;
	return chid;

/*
		chrome.storage.sync.get('cache_youtube_channel_id', function(settings) {
			if(settings.hasOwnProperty('cache_youtube_channel_id')) {
				get_latest_channel_id.latest_channel_id = settings['cache_youtube_channel_id'];
				chid_receiver(settings['cache_youtube_channel_id']);
			} else {
				chid_receiver(undefined);
			}
		});*/

}

function get_channel_name_from_dom() {
	if($("#account-name").length == 0) return null;
	return $("#account-name").text();
}

function get_latest_channel_name(settings) {
	var name_cache_key = 'cache_youtube_channel_name';

	var channel_name = get_channel_name_from_dom();
	if(channel_name != null) {
		chrome.storage.sync.set({[name_cache_key]: channel_name}, function() {
			console.log("Stored " + name_cache_key + " = " + channel_name);
		});
		get_latest_channel_name.latest_channel_name = channel_name;
		return channel_name;
	} else if(get_latest_channel_name.latest_channel_name != undefined) {
		return get_latest_channel_name.latest_channel_name;
	} 
	var cname = settings.get(name_cache_key);
	get_latest_channel_name.latest_channel_name = cname;
	return cname;
		
		/*chrome.storage.sync.get('cache_youtube_channel_name', function(settings) {
			if(settings.hasOwnProperty('cache_youtube_channel_name')) {
				get_latest_channel_name.latest_channel_name = settings['cache_youtube_channel_name'];
				cname_receiver(settings['cache_youtube_channel_name']);
			} else {
				cname_receiver(undefined);
			}
		});*/
}

function get_channel_user_from_dom(channel_id) {
	if(is_channel_page_by_chid(channel_id)) {
		var action = $("form#form.style-scope.ytd-expandable-tab-renderer").attr("action");

		var match = action.match(new RegExp("user\/(.+)\/"));
		if(match != null) {
			//console.log("determined cuser = " + match[1]);
			return match[1];
		}
	}
	return null;
}

function get_latest_channel_user(settings, channel_id) {
	var user_cache_key = 'cache_youtube_channel_user';
	var channel_user = get_channel_user_from_dom(channel_id);
	if(channel_user != null) {
		chrome.storage.sync.set({[user_cache_key]: channel_user}, function() {
			console.log("Stored " + user_cache_key + " = " + channel_user);
		});
		get_latest_channel_user.latest_channel_user = channel_user;
		return channel_user;
	} else if(get_latest_channel_user.latest_channel_user != undefined) {
		return get_latest_channel_user.latest_channel_user;
	} 
	var cuser = settings.get(user_cache_key);
	get_latest_channel_user.latest_channel_user = cuser;
	return cuser;
}


function is_watch_page() {
	var reg = new RegExp('youtube\.com\/watch\?');
	return reg.test(window.location.href);
}

function is_subscriptions_page() {
	var reg = new RegExp('youtube\.com\/feed\/subscriptions');
	return reg.test(window.location.href);
}

function is_channel_page_by_chid(channel_id) {
	if(channel_id == null) return false;
	return window.location.href.includes("/channel/" + channel_id);
}

function is_channel_page_by_user(channel_user) {
	if(channel_user == null) return false;
	return window.location.href.includes("/user/" + channel_user);
}

function hide_video_stats(replacement) {
	console.log("replacement = " + replacement);
	// view count
	$(".view-count").html(replacement);

	// like button
	$("yt-formatted-string.ytd-toggle-button-renderer").html(replacement == "" ? "" : "X");

	// hide like bar
	$("#like-bar").hide();

	// hide comment count
	var eles = $(".ytd-comments .count-text");
	if(eles.length > 0) {
		var ele = eles.first();
		var results = ele.html().match(new RegExp('([0-9]+) Comments'));
		if(results == null) return;
		if(results[1] >= 5) {
			ele.html("Many Comments");
		}
	}
}

function is_my_video_watch_page() {
	var first = $("a.ytd-video-owner-renderer").first();
	var href = first.attr("href");
	var label = first.attr("aria-label");
	if(href != null && href.includes(channel_id)) {
		console.log("Based on chid, this is your video. Hiding video stats...");
		return true;
	} else if(label != null && label.includes(channel_name)) {
		console.log("Based on name, this is your video. Hiding video stats...");
		return true;
	}
	return false;
}

function modify(settings) {
	console.log("modify------~~~~");

	var replacement = settings.replacement;
	console.log("replacement = " + replacement);

	var channel_id = get_latest_channel_id(settings);
	var channel_name = get_latest_channel_name(settings);
	var channel_user = get_latest_channel_user(settings, channel_id);

	console.log("chid = " + channel_id + ", cname = " + channel_name + ", cuser = " + channel_user);

	if(is_subscriptions_page()) {
		console.log("subscription page");
		/*
		subscription poage
		$(".ytd-grid-video-renderer").each(function(i, vid) {

		});*/
	} else if(is_watch_page()) {
		console.log("watch page");
		if(channel_id != null) {
			//console.log("using channel_id = " + channel_id);

			if(settings.get('youtube_hide_video_stats') && is_my_video_watch_page()) {
				hide_video_stats(replacement);
			}
		} 
	} else if(is_channel_page_by_chid(channel_id) || is_channel_page_by_user(channel_user)) {
		console.log("is your channel");
		if(settings.get('youtube_hide_video_stats')) {
			// remove video views on channel
			$("#metadata-line span:first-child").html(replacement);
		}
	}
}

xinspect(window["ytInitialData"]);

initialize_dynamic(modify);


