class SettingsReader {
	constructor(settings) {
		this.settings = settings;

		// defaults generated from options.js
		this.defaults = {"general_leave_no_trace":false,"facebook_hide_friend_counts":true,"twitter_hide_tweet_comments":false,"twitter_hide_tweet_retweet":true,"twitter_hide_tweet_likes":true,"twitter_hide_like_notifications":true,"twitter_hide_retweet_notifications":true,"twitter_hide_follow_notifications":true,"youtube_hide_video_stats":true,"facebook_comment_reactions":"removeentirely","reddit_upvotes":"removeentirely","twitter_followers":"hover"};
	}

	get(key, last_resort_value=undefined) {
		if(!this.settings.hasOwnProperty(key)) {
			if(this.defaults.hasOwnProperty(key)) {
				//console.log(key + " == " + this.defaults[key] + " in defaults map");
				return this.defaults[key];
			}
		    return last_resort_value;
		}
		//console.log(key + " == " + this.settings[key] + " in settings map");
		return this.settings[key];
	}

	get replacement() {
		if(this.get("general_leave_no_trace")) {
			return "";
		} 
		return "HSM";
	}

	get reddit_allow_hover() {
		return this.get("reddit_upvotes") != "removeentirely";
	}

	get twitter_followers_allow_hover() {
		return this.get("twitter_followers") != "removeentirely";
	}
}

// initialize content script for a dynamic webpage
function initialize_dynamic(settings_receiver, monitor=null) {
	chrome.storage.sync.get(null, function(settings_map) {
		var settings = new SettingsReader(settings_map);
		settings_receiver(settings);

		$(monitor == null ? document : monitor).bind('DOMSubtreeModified.event1', function() {
			// 
			// temporarily remove handler to prevent infinite recursion
			$(this).unbind('DOMSubtreeModified.event1');
    		setTimeout(function() {
    			initialize_dynamic(settings_receiver, monitor);
    		}, 10);
		});
	});
}

function initialize_static(settings_receiver) {
	chrome.storage.sync.get(null, function(settings_map) {
		var settings = new SettingsReader(settings_map);
		settings_receiver(settings);
	});
}

// not my code, taken from stackoverflow
function xinspect(o,i){
    if(typeof i=='undefined')i='';
    if(i.length>50)return '[MAX ITERATIONS]';
    var r=[];
    for(var p in o){
        var t=typeof o[p];
        r.push(i+'"'+p+'" ('+t+') => '+(t=='object' ? 'object:'+xinspect(o[p],i+'  ') : o[p]+''));
    }
    return r.join(i+'\n');
}