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

function mark_vids_seen(seen_vids) {
	console.log("mark_vids_seen()");

	// update seen_vids 
}

function video_url_to_id(vid_url) {
	var reg = new RegExp('watch\\?v=([a-zA-Z0-9_-]+)');
	var match = vid_url.match(reg);
	if(!match) return null;
	return match[1];
}

function video_url_to_startsec(vid_url) {
	var reg = new RegExp('&t=([0-9]+)');
	var match = vid_url.match(reg);
	if(!match) return 0;
	return parseInt(match[1]);
}

function sub_vids_query_grid() {
	return $("span[id='title']:contains('Today')")
		.closest("#contents")
		.find("ytd-grid-video-renderer");
}

function sub_vids_query_listview() {
	return $("ytd-browse[role='main'] ytd-item-section-renderer");
}

function sub_vids_jquery() {
	var grid = sub_vids_query_grid();
	if(grid.length > 0) return grid;
	return sub_vids_query_listview();
}

function shade_or_hide(jquery, opacity) {
	if(parseFloat(opacity) == 0.0) {
		jquery.hide();
	} else {
		jquery.css("opacity", opacity);
		jquery.show();
	}
}

function shade_video(jquery, opacity, index=-1) {
	if(jquery.is("ytd-item-section-renderer")) { 
		shade_video_listview(jquery, opacity, index);
	} else {

		shade_or_hide(jquery, opacity);

		//jquery.css("opacity", opacity);
		
	}
}

function shade_video_listview(jquery, opacity, index=-1) {
	var ele_to_shade = jquery;
	if(index == 0) {
		ele_to_shade = jquery.find("#contents.ytd-shelf-renderer ytd-expanded-shelf-contents-renderer, #title");
	} 

	shade_or_hide(ele_to_shade, opacity);
	/*if(parseFloat(opacity) == 0.0) {
		ele_to_shade.hide();
	} else {
		ele_to_shade.css("opacity", opacity);
		ele_to_shade.show();
		//if(!ele_to_shade.is(":visible")) ele_to_shade
	}*/
}

function shade_videos(jquery, opacity) {
	if(jquery.first().is("ytd-item-section-renderer")) {
		// is list view
		jquery.each(function(i) {
			shade_video_listview($(this), opacity, i);
		});

	} else {
		//jquery.css("opacity", opacity);
		//jquery.show();

		shade_or_hide(jquery, opacity);
	}
}

// Video playback speed
function get_speed_passive_mainmenu() {
	return $(".ytp-settings-menu .ytp-menuitem:has(.ytp-menuitem-label:contains('Speed')) .ytp-menuitem-content")
		.text();
}

function in_speedmenu() {
	return $(".ytp-settings-menu .ytp-panel-header").text() == "Speed";
}

function get_speed_passive_speedmenu() {
	if(in_speedmenu()) {
		// speed menu opened
		return $(".ytp-settings-menu .ytp-menuitem[aria-checked='true']").text();
	}
	return null;
}

function get_speed_passive() {
	var main_menu_speed = get_speed_passive_mainmenu();
	if(main_menu_speed) return main_menu_speed;

	return get_speed_passive_speedmenu();
}

function get_speed() {
	var started_opened = $(".ytp-settings-menu").css("display") == "none";
	if(!started_opened) $(".ytp-settings-button").click();
	

	//$(".ytp-settings-menu .ytp-menuitem:has(.ytp-menuitem-label:contains('Speed'))").click();
	//var txt = $(".ytp-settings-menu .ytp-menuitem[aria-checked='true']").text();
	var txt = get_speed_passive();

	if(!started_opened) $(".ytp-settings-button").click();

	return txt;
}

function set_speed(speed) {
	$(".ytp-settings-button").click();
	if(get_speed_passive_mainmenu() != speed) {
		// speed must be changed
		$(".ytp-settings-menu .ytp-menuitem:has(.ytp-menuitem-label:contains('Speed'))").click();

		$(".ytp-settings-menu .ytp-menuitem").each(function() {
			if($(this).text() == speed) {
				$(this).click();
			}
		});
	}

	$(".ytp-settings-button").click();
}




function modify_subscriptions_page(settings) {
	var HideSeenVidsKey = "youtube_hide_seen_vids";
	var SeenVideosKey = "youtube_seen_videos";
	console.log("subscription page");

	modify_subscriptions_page.seen_videos = new Set(settings.get(SeenVideosKey, []));
	modify_subscriptions_page.latest_settings = settings;
	
	var hide_seen_vids = settings.get(HideSeenVidsKey, false);

	var opacity = "0.36"; 
	if(hide_seen_vids) {
		opacity = "0.0"; // hide() videos
	}

	var unseen_urls_on_this_page = new Set();
	// find first element after "today", then only search for elements in the same list

	sub_vids_jquery().each(function(i) {
		var title_ele = $(this).find("#video-title");
		/*
		var vid_title = title_ele.attr("title");
		
		var channel_ele = $(this).find("#byline a");
		var channel_url = channel_ele.attr("href");
		var channel_name = channel_ele.text();
		*/

		var href = title_ele.attr("href");
		if(href) {
			var vid_id = video_url_to_id(href);
			
			if(modify.seen_videos.has(vid_id)) {
				// if this video is already in seen_videos, shade it out
				// shade
				
				shade_video($(this), opacity, i);
			} else {
				// generate array of video urls on this page.
				var startsec = video_url_to_startsec(href);
				var overlay_text = $(this).find(".ytd-thumbnail-overlay-playback-status-renderer").text();
				if(startsec > 30 || overlay_text == "WATCHED") {
					// this could be put in the if expression above, but then 
					// the videos won't be shaded out instantly when they appear.
					shade_video($(this), opacity, i);
				}

				unseen_urls_on_this_page.add(vid_id);
			}
		}
	});

	modify_subscriptions_page.unseen = unseen_urls_on_this_page;




	var buttons = $(".grid-subheader.style-scope.ytd-shelf-renderer #title-container #menu #top-level-buttons:has(button[aria-label='Switch to grid view'])");
	
	if(!buttons.find("#mark_vids_seen").length) {
		console.log("creating hsm_group...");

		buttons.prepend($("<input />")
			.attr("id", "mark_vids_seen")
			.attr("type", "button")
			.attr("value", "Mark all as seen")
			.click(function() {
				//mark_vids_seen();
				// merge the static urls_on_this_page with seen_videos,
				// then save it to the SeenVideosKey
				modify_subscriptions_page.unseen.forEach(function(val) {
					modify_subscriptions_page.seen_videos.add(val);
				});

				chrome.storage.sync.set({
					[SeenVideosKey]: Array.from(modify_subscriptions_page.seen_videos)
				});

				//sub_vids_jquery().css("opacity", "0.5");
				shade_videos(sub_vids_jquery(), "0.5");
			}));


		buttons.prepend($("<input />")
			.attr("id", "mark_vids_unseen")
			.attr("type", "button")
			.attr("value", "Mark all as unseen")
			.css("margin-right", "15px")
			.click(function() {
				//mark_vids_seen();
				// merge the static urls_on_this_page with seen_videos,
				// then save it to the SeenVideosKey

				modify_subscriptions_page.seen_videos.clear();

				chrome.storage.sync.set({
					[SeenVideosKey]: []
				});

				shade_videos(sub_vids_jquery(), "");
			}));

		// hide seen vids checkbox
		var cb = $("<input />")
			.attr("id", "hide_seen_vids")
			.attr("type", "checkbox")
			.css("vertical-align", "middle")
			.prop("checked", hide_seen_vids)
			.change(function() {
				
				var checked = $(this).prop("checked");
				console.log("checked = " + checked);
				chrome.storage.sync.set({[HideSeenVidsKey]: checked});

				// use this static value because "settings" could be old
				modify_subscriptions_page.latest_settings.set_val(HideSeenVidsKey, checked);
				modify(modify_subscriptions_page.latest_settings);
			});

		var label = $("<label></label>")
			.attr("for", "hide_seen_vids")
			.css("vertical-align", "middle")
			.html("Hide seen videos");

		buttons.prepend($("<div></div>")
			.attr("id", "hide_seen_vids_group")
			.css("margin-right", "15px")
			.css("margin-top", "auto")
			.css("margin-bottom", "auto")
			.append(cb)
			.append(label));
	} else {
		console.log("hsm_group already exists");
	}
}

function hide_comments(identity, replacement) {
	// hide comment upvotes
	$("ytd-comment-renderer[id='comment'], ytd-comment-renderer.ytd-comment-replies-renderer").each(function() {
		var a_author_text = $(this).find("#author-text");
		var author_url = a_author_text.attr("href");
		var author_name = a_author_text.text().trim();
		//console.log("comment: " + author_name + " " + author_url);
		if(identity.equals_url_or_display(author_url, author_name)) {
			console.log("found a comment of yours");
			$(this).find("#vote-count-middle").html(replacement);
		}
	});
}

function video_category_passive() {
	return $("ytd-metadata-row-renderer:has(#title:contains('Category')) a").text().trim();
}

function video_category(callback) {
	var vid_id = video_url_to_id(window.location.href);
	if(video_category.cache) {
		if(vid_id && video_category.cache.hasOwnProperty(vid_id)) {
			callback(video_category.cache[vid_id]);
			return;
		}
	} else {
		video_category.cache = {};
	}
	
	var ret = function(cat) {
		if(vid_id && cat) video_category.cache[vid_id] = cat;
		callback(cat);
	}

	var query = "ytd-metadata-row-renderer:has(#title:contains('Category')) a";
	var cat_ele = $(query);
	
	if(cat_ele.length) {
		ret(cat_ele.text().trim());
		return;
	} 

	//$(document).unbind('DOMSubtreeModified.event1');
	$(".more-button").first().click();
	//var cat = $(query).text().trim();
	setTimeout(function() {
		var cat = $(query).text().trim();
		$(".less-button").first().click();
		ret(cat);
		//initialize_dynamic(modify);
	}, 10);
}

function modify_watch_page(settings) {
	var identity = new YouTubeIdentity(settings);
	var replacement = settings.replacement;
	console.log("watch page");

	if(identity.id) { // we know SOME info about the user at least
		//console.log("using channel_id = " + channel_id);

		if(settings.get('youtube_hide_video_stats') && is_my_video_watch_page(identity)) {
			hide_video_stats(replacement);
		}

		hide_comments(identity, replacement);
	} 

	video_category(function(cat) {
		// when the url changes, try getting the speed until you're able
		// then set the speed if needed

		switch(cat) {
			case "News & Politics":
				console.log("Setting speed 1.25");
				//set_speed("1.25");
				break;
			case "Music":
				console.log("Setting speed Normal");
				//set_speed("Normal");
				break;
			default:
				console.log("Unknown cat: " + cat);
				break;
		}
	});
}

function modify_channel_page(settings) {
	console.log("is your channel");
	var replacement = settings.replacement;

	if(settings.get('youtube_hide_video_stats')) {
		// remove video views on channel
		$("#metadata-line span:first-child").html(replacement);
	}

	// hide subscriber count on channel
	var sub_count = $("#channel-header-container yt-formatted-string#subscriber-count");
	sub_count.attr("title", sub_count.text());
	sub_count.html(replacement);
}

// todo: make these static in modify()

function modify(settings) {
	console.log("modify--------------");
	
	var identity = new YouTubeIdentity(settings);
	
	if(is_subscriptions_page()) {
		modify_subscriptions_page(settings);
	} else if(is_watch_page()) {
		modify_watch_page(settings)
	} else if(is_channel_page(identity)) {
		modify_channel_page(settings);
	}
}

xinspect(window["ytInitialData"]);

initialize_dynamic(modify);


