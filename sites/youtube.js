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

	var stored_chid = settings.get(chid_cache_key);

	var channel_id = get_channel_id_from_dom();
	if(channel_id != null) {
		if(stored_chid != channel_id) {
			chrome.storage.sync.set({[chid_cache_key]: channel_id}, function() {
				//console.log("Stored " + chid_cache_key + " = " + channel_id);
			});
		}
		
		get_latest_channel_id.latest_channel_id = channel_id;
		return channel_id;
	} else if(get_latest_channel_id.latest_channel_id != undefined) {
		return get_latest_channel_id.latest_channel_id;
	} 
	
	get_latest_channel_id.latest_channel_id = stored_chid;
	return stored_chid;
}

function get_channel_name_from_dom() {
	if($("#account-name").length == 0) return null;
	return $("#account-name").text();
}

function get_latest_channel_name(settings) {
	var name_cache_key = 'cache_youtube_channel_name';
	var stored_cname = settings.get(name_cache_key);
	var channel_name = get_channel_name_from_dom();
	if(channel_name != null) {
		if(stored_cname != channel_name) {
			chrome.storage.sync.set({[name_cache_key]: channel_name}, function() {
				//console.log("Stored " + name_cache_key + " = " + channel_name);
			});
		}
		
		get_latest_channel_name.latest_channel_name = channel_name;
		return channel_name;
	} else if(get_latest_channel_name.latest_channel_name != undefined) {
		return get_latest_channel_name.latest_channel_name;
	} 
	
	get_latest_channel_name.latest_channel_name = stored_cname;
	return stored_cname;
}

function get_channel_user_from_dom(channel_id) {
	if(is_channel_page_by_chid(channel_id)) {
		var action = $("form#form.style-scope.ytd-expandable-tab-renderer").attr("action");
		if(!action) return null;

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
	var stored_cuser = settings.get(user_cache_key);
	var channel_user = get_channel_user_from_dom(channel_id);
	if(channel_user != null) {
		if(stored_cuser != channel_user) {
			chrome.storage.sync.set({[user_cache_key]: channel_user}, function() {
				//console.log("Stored " + user_cache_key + " = " + channel_user);
			});
		}
		
		get_latest_channel_user.latest_channel_user = channel_user;
		return channel_user;
	} else if(get_latest_channel_user.latest_channel_user != undefined) {
		return get_latest_channel_user.latest_channel_user;
	} 
	
	get_latest_channel_user.latest_channel_user = stored_cuser;
	return stored_cuser;
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

function video_uploader() {
	return $("#upload-info #owner-name a").first().text();
}

function hide_video_stats(replacement) {
	console.log("hide_video_stats(" + replacement);
	// view count
	
	$(".view-count").html(replacement);

	var like_button_replacement = replacement == "" ? "" : "X";
	$("yt-formatted-string.ytd-toggle-button-renderer").html(like_button_replacement);

	/*$(".view-count").each(function() {
		console.log("hide_video_stats.view-count = " + $(this).html());
		if($(this).html() != replacement) {
			$(this).attr("saved_text", $(this).html());
		}
		$(this).html(replacement);
	});


	// like button
	
	$("yt-formatted-string.ytd-toggle-button-renderer").each(function() {
		var html = $(this).html();
		if(like_button_replacement && html.includes(like_button_replacement) 
			&& html.length > like_button_replacement.length) {
			// some sort of bug when you load new video after
			// viewing your own video that makes the like/dislike counts like:
			// X17K and X207
			// remove the X and save the text
			var save_txt = html.replace(like_button_replacement, "");
			$(this).attr("saved_text", save_txt);
		} else if(html && html != like_button_replacement) {
			$(this).attr("saved_text", html);
		}
		$(this).html(like_button_replacement);
	});*/

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

function show_video_stats(replacement) {
	console.log("show_video_stats(" + replacement);
	var like_button_replacement = replacement == "" ? "" : "X";

	$(".view-count").each(function() {
		console.log("show_video_stats.view-count = " + $(this).html());
		if($(this).html() == replacement) {
			var saved_txt = $(this).attr("saved_text");
			if(saved_txt) {
				$(this).html(saved_txt);
				$(this).removeAttr("saved_text");
			} else {
				var svc = $(this).sublings(".short-view-count").html();
				console.log("taking view count from sibling: " + svc);
				if(svc) $(this).html(svc);
			}
		} 

		/*else if(like_button_replacement && $(this).html().includes(like_button_replacement)) {
			$(this).html($(this).html().replace(like_button_replacement, ""));
		}*/
	});

	$("yt-formatted-string.ytd-toggle-button-renderer").each(function() {
		var html = $(this).html();
		if(like_button_replacement && html.includes(like_button_replacement) 
			&& html.length > like_button_replacement.length) {
			var new_txt = html.replace(like_button_replacement, "");
			console.log(html + " -> " + new_txt);
			$(this).html(new_txt);
		} else {
			var save_txt = $(this).attr("saved_text");
			if(save_txt) $(this).html(save_txt);
			console.log("restoring from save_txt: " + save_txt);
		}
		$(this).removeAttr("saved_text");
	});

	$("#like-bar").show();
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
	}
}

function shade_video_listview(jquery, opacity, index=-1) {
	var ele_to_shade = jquery;
	if(index == 0) {
		ele_to_shade = jquery.find("#contents.ytd-shelf-renderer ytd-expanded-shelf-contents-renderer, #title");
	} 

	shade_or_hide(ele_to_shade, opacity);
}

function shade_videos(jquery, opacity) {
	if(jquery.first().is("ytd-item-section-renderer")) {
		// is list view
		jquery.each(function(i) {
			shade_video_listview($(this), opacity, i);
		});
	} else {
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
	var started_opened = $(".ytp-settings-menu").css("display") != "none";
	if(!started_opened) $(".ytp-settings-button").click();
	
	var txt = get_speed_passive();

	if(!started_opened) $(".ytp-settings-button").click();

	return txt;
}

function set_speed(speed) {
	console.log("set_speed(" + speed);

	var started_opened = $(".ytp-settings-menu").css("display") != "none";
	if(!started_opened) $(".ytp-settings-button").click();

	if(get_speed_passive_mainmenu() != speed) {
		// speed must be changed
		$(".ytp-settings-menu .ytp-menuitem:has(.ytp-menuitem-label:contains('Speed'))").click();

		$(".ytp-settings-menu .ytp-menuitem").each(function() {
			if($(this).text() == speed) {
				$(this).click();
			}
		});
	}

	if(!started_opened) $(".ytp-settings-button").click();
}


function video_title() {
	return $("h1.title.ytd-video-primary-info-renderer").text();
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
			
			if(modify_subscriptions_page.seen_videos.has(vid_id)) {
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

	var buttons = $(".grid-subheader.style-scope.ytd-shelf-renderer #title-container #menu #top-level-buttons")
		.filter(":has(button[aria-label='Switch to grid view'])");

	if(buttons.length && !buttons.find("#mark_vids_seen").length) {
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
				shade_videos(sub_vids_jquery(), opacity);
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
		//console.log("hsm_group already exists");
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
	return $("ytd-expander ytd-metadata-row-renderer:has(#title:contains('Category'))").find("a").text().trim();
}

function video_category(callback, passive_only=false) {
	console.time("video_category");

	var vid_id = video_url_to_id(window.location.href);
	if(video_category.cache) {
		if(vid_id && video_category.cache.hasOwnProperty(vid_id)) {
			console.log("cached:");
			console.timeEnd("video_category");
			callback(video_category.cache[vid_id]);

			return;
		}
	} else {
		video_category.cache = {};
	}

	var cat_ele = $("ytd-expander ytd-metadata-row-renderer:has(#title:contains('Category'))").find("a");
	
	if(cat_ele.length) {
		var cat = cat_ele.text().trim();
		if(cat) {

			$(".less-button").first().click();
		}

		if(vid_id && cat) video_category.cache[vid_id] = cat;
		
		console.log("cat:")
		console.timeEnd("video_category");
		callback(cat);

		return;
	} 

	if(passive_only) {
		console.log("passive:");
		console.timeEnd("video_category");
		callback("");
		return;
	}

	var more_but = $(".more-button");
	if(more_but.length) {
		$(".more-button").first().click();
		// it takes 10 ms for the description to open, so just call the func again for the result
	}

	console.log("end:");
	console.timeEnd("video_category");
}


function get_video_time_sec() {
	var first = $(".ytp-time-current").first();
	if(!first) return -1;
	var split = first.text().split(":").map(x => parseInt(x));
	if(split.length == 3) {
		return split[2] * 3600 + split[1] * 60 + split[2];
	} else {
		return split[0] * 60 + split[1];
	}
}

function modify_watch_page(settings) {
	var identity = new YouTubeIdentity(settings);
	var replacement = settings.replacement;

	if(identity.id) { // we know SOME info about the user at least
		if(settings.get('youtube_hide_video_stats') && is_my_video_watch_page(identity)) {
			console.log("is my watch page");
			hide_video_stats(replacement);
			modify_watch_page.hid_video_stats = true;
		} else if(modify_watch_page.hid_video_stats) {
			// if the user navigates to their own video then to another person's video,
			// we have to refresh the page completely. 
			// YouTube uses some sort of element recycling
			location.reload();
			modify_watch_page.hid_video_stats = false;

			return;
		}

		hide_comments(identity, replacement);
	} 

	if(settings.get("youtube_speedmod_enabled", true)) {
		modify_speed(settings);
	}
}

function modify_speed(settings) {
	var href = window.location.href;
	var uploader = video_uploader();
	if(!uploader) {
		console.log("no uploader");
		return;
	}

	if($(".videoAdUi").length) {
		console.log("watching ad");
		return;
	}

	if($(".ytp-live-badge:visible").length != 0) {
		console.log("is live");
		return;
	}

	var channel_speeds = settings.get("youtube_channel_speeds", {});
	var category_speeds = settings.get("youtube_category_speeds", {});

	// modify_watch_page.speedchange_init_href is set when a new href is seen
	// modify_watch_page.speedchange_finished_href is set when speed change process finished
	function is_new_href(href) {
		return modify_watch_page.speedchange_init_href != href;
	}

	function is_speed_change_finished(href) {
		return modify_watch_page.speedchange_finished_href == href;
	}

	if(is_new_href(href) && $(".ytp-settings-menu").length) {
		modify_watch_page.speedchange_init_href = href;

		video_category(function(cat) {
			// open description
			console.log("newurlCategory = " + cat);
		});
	} else if(!is_speed_change_finished(href)) {
		if(uploader && channel_speeds.hasOwnProperty(uploader)) {
			console.log("Uploader = " + uploader);
			set_speed(channel_speeds[uploader]);
			modify_watch_page.speedchange_finished_href = href;
		} else {
			video_category(function(cat) {
				console.log("Category = " + cat);
				if(cat) {
					if(category_speeds.hasOwnProperty(cat)) {
						set_speed(category_speeds[cat]);
					}
					modify_watch_page.speedchange_finished_href = href;
				}
			});
		}
	}

	// only save vid speeds when set_speed already happened
	if(is_speed_change_finished(href)) {
		// when settings menu is opened, we can get the current speed
		try_save_current_video_speed(settings);
	}
	
}

function try_save_current_video_speed(settings) {
	var href = window.location.href;
	var speed_passive = get_speed_passive();
	if(speed_passive && 
		(try_save_current_video_speed.prev_speed_passive != speed_passive || 
			try_save_current_video_speed.prev_href != href)) {

		try_save_current_video_speed.prev_speed_passive = speed_passive;
		try_save_current_video_speed.prev_href = href;

		var channel_speeds = settings.get("youtube_channel_speeds", {});
		var category_speeds = settings.get("youtube_category_speeds", {});


		console.log("speed_passive = " + speed_passive);
		// this part is slow for the first time only it's not async properly
		video_category(function(cat) {
			if(cat &&
				(!category_speeds.hasOwnProperty(cat) || category_speeds[cat] != speed_passive)) {
				category_speeds[cat] = speed_passive;
				chrome.storage.sync.set({"youtube_category_speeds": category_speeds}, function() {
					console.log("youtube_category_speeds = " + xinspect(category_speeds));
				});
			}
		});

		var uploader = video_uploader();
		if(uploader &&
			(!channel_speeds.hasOwnProperty(uploader) || channel_speeds[uploader] != speed_passive)) {
			channel_speeds[uploader] = speed_passive;
			chrome.storage.sync.set({"youtube_channel_speeds": channel_speeds}, function() {
				console.log("youtube_channel_speeds = " + xinspect(channel_speeds));
			});
		}
	}
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
	
	if(settings.get("youtube_enable")) {
		var identity = new YouTubeIdentity(settings);
	
		if(is_subscriptions_page()) {
			modify_subscriptions_page(settings);
		} else if(is_watch_page()) {
			modify_watch_page(settings)
		} else if(is_channel_page(identity)) {
			modify_channel_page(settings);
		}
	}

	$("yt-formatted-string.ytd-toggle-button-renderer").css("visibility", "visible");
	$(".view-count").css("visibility", "visible");
	$("#like-bar").css("visibility", "visible");
}



initialize_dynamic(modify, document, 150);


