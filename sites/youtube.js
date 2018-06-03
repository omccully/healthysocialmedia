console.log("youtube.js exec");

function get_channel_id() {
	var regex = new RegExp('\/channel\/([^?]+)');
	var channel_id = null;
	// ".yt-simple-endpoint"
	// ".style-scope"
	$("iron-dropdown").each(function(j, dropdown) {
		$(dropdown).find(".ytd-compact-link-renderer").each(function(i, endpoint) {
			var href = $(endpoint).attr("href");
			// TODO: this loops like 80 times
			if(href != null) {
				var match = href.match(regex);
				if(match != null) {
					channel_id = match[1];
				}
			}
		});
	});

	return channel_id;
}

function is_watch_page() {
	var reg = new RegExp('youtube\.com\/watch\?');
	return reg.test(window.location.href);
}

function is_subscriptions_page() {
	var reg = new RegExp('youtube\.com\/feed\/subscriptions');
	return reg.test(window.location.href);
}

function is_channel_page(channel_id) {
	if(channel_id == null) return false;
	return window.location.href.includes("/channel/" + channel_id);
}

function hide_video_stats() {
	// view count
	$(".view-count").html("HSM");

	// like button
	$("yt-formatted-string.ytd-toggle-button-renderer").html("X");

	// hide like bar
	$("#like-bar").hide();

	// hide comment count
	//$(".ytd-comments").find("#title").find("#count")
	//	.find("yt-formatted-string .ytd-comments-header-renderer").html("HSM");

	var ele = $(".ytd-comments").find(".count-text").first();

	var results = ele.html().match(new RegExp('([0-9]+) Comments'));
	if(results == null) return;
	if(results[1] >= 5) {
		ele.html("Many Comments");
	}
}

var ChannelId = null;

function modify() {
	console.log("modify");
	var channel_id = get_channel_id();
	if(channel_id != null) {
		chrome.storage.local.set({'channel_id': channel_id}, function() {
			console.log("Stored channel_id = " + channel_id);
		});
		ChannelId = channel_id;
	}

	if(is_subscriptions_page()) {
		console.log("subscription page");
		/*
		subscription poage
		$(".ytd-grid-video-renderer").each(function(i, vid) {

		});*/
	} else if(is_watch_page()) {
		console.log("watch page");
		if(ChannelId != null) {
			console.log("using ChannelId for watch page");

			var href = $(".ytd-video-owner-renderer").attr("href");
			if(href != null) {
				if(href.includes(ChannelId)) {
					console.log("This is your video. Hiding video stats...");
					hide_video_stats();
				}
			}
		} else if(is_channel_page(ChannelId)) {
			// remove video views on channel
			$("#metadata-line").children().first().html("HSM")
		}
	}
}

function DOMModificationHandler(){
    $(this).unbind('DOMSubtreeModified.event1');
    setTimeout(function(){
        modify();
        $(document).bind('DOMSubtreeModified.event1',
                                   DOMModificationHandler);
    },50);
}

function xinspect(o,i){
    if(typeof i=='undefined')i='undefined';
    if(i.length>50)return '[MAX ITERATIONS]';
    var r=[];
    for(var p in o){
        var t=typeof o[p];
        r.push(i+'"'+p+'" ('+t+') => '+(t=='object' ? 'object:'+xinspect(o[p],i+'  ') : o[p]+''));
    }
    return r.join(i+'\n');
}

chrome.storage.local.get({'channel_id': null}, function(result) {
	ChannelId = result.channel_id;
	console.log("Loaded channel_id " + ChannelId);

	modify();
	$(document).bind('DOMSubtreeModified.event1', DOMModificationHandler);
});


