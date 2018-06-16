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

	set_val(key, value) {
		this.settings[key] = value;
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

function initialize_static(settings_receiver) {
	chrome.storage.sync.get(null, function(settings_map) {
		var settings = new SettingsReader(settings_map);

		console.time("settings_receiver_static");
		settings_receiver(settings);
		console.timeEnd("settings_receiver_static");
	});
}

// initialize content script for a dynamic webpage
function initialize_dynamic(settings_receiver, monitor=null, ms=50) {
	initialize_static(function(settings) {
		console.time("settings_receiver_init");
		settings_receiver(settings);
		console.timeEnd("settings_receiver_init");
		bind_dynamic(settings_receiver, monitor, ms);
	});
}

function unbind_dynamic(monitor=null) {
	$(monitor == null ? document : monitor).unbind('DOMSubtreeModified.event1');
}

// swap this so it can't miss
function bind_dynamic(settings_receiver, monitor=null, ms=50) {
	$(monitor == null ? document : monitor).one('DOMSubtreeModified.event1', function() {

		//$(this).unbind("DOMSubtreeModified.event1");
		//console.log("Event=" + xinspect(event));
		

		// settings_receiver instantly, but take a while to rebind
		//initialize_static(settings_receiver);

		setTimeout(function() {
			initialize_dynamic(settings_receiver, monitor, ms);
			//bind_dynamic(settings_receiver, monitor, ms);
		}, ms);

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
