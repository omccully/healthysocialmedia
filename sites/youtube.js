console.log("youtube.js exec");

class YouTubeIdentity {
	constructor(settings) {
		this.id = get_latest_channel_id(settings);
		this.display_name = get_latest_channel_name(settings);
		this.user_name = get_latest_channel_user(settings, this.id);

		console.log("chid = " + this.id + ", cname = " + this.display_name + ", cuser = " + this.user_name);
	}

	equals_url(url) {
		return (this.id && url.includes("channel/" + this.id)) || 
			(this.user_name && url.includes("user/" + this.user_name));
	}

	equals_display_name(display) {
		return display.trim() == this.display_name;
	}

	equals_url_or_display(url, display) {
		return this.equals_url(url) || this.equals_display_name(display);
	}
}

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
			//console.log("Stored " + chid_cache_key + " = " + channel_id);
		});
		get_latest_channel_id.latest_channel_id = channel_id;
		return channel_id;
	} else if(get_latest_channel_id.latest_channel_id != undefined) {
		return get_latest_channel_id.latest_channel_id;
	} 
	var chid = settings.get(chid_cache_key);
	get_latest_channel_id.latest_channel_id = chid;
	return chid;
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
			//console.log("Stored " + name_cache_key + " = " + channel_name);
		});
		get_latest_channel_name.latest_channel_name = channel_name;
		return channel_name;
	} else if(get_latest_channel_name.latest_channel_name != undefined) {
		return get_latest_channel_name.latest_channel_name;
	} 
	var cname = settings.get(name_cache_key);
	get_latest_channel_name.latest_channel_name = cname;
	return cname;
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
			//console.log("Stored " + user_cache_key + " = " + channel_user);
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


function is_subscriptions_page() {
	var reg = new RegExp('youtube\.com\/feed\/subscriptions');
	return reg.test(window.location.href);
}

function is_channel_page_by_chid(channel_id) {
	if(!channel_id) return false;
	return window.location.href.includes("channel/" + channel_id);
}

function is_channel_page(identity) {
	return identity.equals_url(window.location.href);
}

function is_watch_page() {
	var reg = new RegExp('youtube\.com\/watch\?');
	return reg.test(window.location.href);
}

function is_my_video_watch_page(identity) {
	var first = $("a.ytd-video-owner-renderer").first();
	var href = first.attr("href");
	var label = first.attr("aria-label");
	return (href && identity.equals_url(href)) || 
		(label && identity.display_name && label.includes(identity.display_name));
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

function hide_sub_vids() {
	console.log("hide_sub_vids()");
}



function modify(settings) {
	console.log("modify--------------");

	var replacement = settings.replacement;
	//console.log("replacement = " + replacement);

	var identity = new YouTubeIdentity(settings);

	
	if(is_subscriptions_page()) {
		console.log("subscription page");
		/*
		subscription poage
		$(".ytd-grid-video-renderer").each(function(i, vid) {

		});*/
		/*var buttons = $(".grid-subheader.style-scope.ytd-shelf-renderer #title-container #menu #top-level-buttons:has(button[aria-label='Switch to grid view'])");
		if(buttons.find("#hide_sub_vids").length == 0) {
			var button = $("<input />")
				.attr("id", "hide_sub_vids")
				.attr("type", "button")
				.attr("value", "Hide all")
				.click(function() {
					hide_sub_vids();
				});
			console.log("")
			buttons.prepend(button);
		}

		I'll have to do this by finding some other element and searching after that one.
		*/
	} else if(is_watch_page()) {
		console.log("watch page");
		if(identity.id) { // we know SOME info about the user at least
			//console.log("using channel_id = " + channel_id);

			if(settings.get('youtube_hide_video_stats') && is_my_video_watch_page(identity)) {
				hide_video_stats(replacement);
			}

			// hide my comment upvotes
			$("ytd-comment-renderer[id='comment'], ytd-comment-renderer.ytd-comment-replies-renderer").each(function() {
				var a_author_text = $(this).find("#author-text");
				var author_url = a_author_text.attr("href");
				var author_name = a_author_text.text().trim();
				console.log("comment: " + author_name + " " + author_url);
				if(identity.equals_url_or_display(author_url, author_name)) {
					console.log("found a comment of yours");
					$(this).find("#vote-count-middle").html(replacement);
				}
			});
		} 
	} else if(is_channel_page(identity)) {
		console.log("is your channel");
		if(settings.get('youtube_hide_video_stats')) {
			// remove video views on channel
			$("#metadata-line span:first-child").html(replacement);
		}

		// hide subscriber count on channel
		var sub_count = $("#channel-header-container yt-formatted-string#subscriber-count");
		sub_count.attr("title", sub_count.text());
		sub_count.html(replacement);
	}
}

xinspect(window["ytInitialData"]);

initialize_dynamic(modify);


