class SettingsReader {
	constructor(settings) {
		this.settings = settings;

		// defaults generated from options.js
		this.defaults = {"general_leave_no_trace":false,"facebook_enable":true,"facebook_hide_friend_counts":true,"reddit_enable":true,"twitter_enable":true,"twitter_hide_tweet_comments":false,"twitter_hide_tweet_retweet":true,"twitter_hide_tweet_likes":true,"twitter_hide_like_notifications":true,"twitter_hide_retweet_notifications":true,"twitter_hide_follow_notifications":true,"twitter_hide_likemention_notifications":true,"twitter_exclude_hidden_notifications":true,"youtube_enable":true,"youtube_speedmod_enabled":true,"youtube_hide_video_stats":true,"facebook_comment_reactions":"removeentirely","reddit_upvotes":"removeentirely","reddit_karma":"removeentirely","twitter_followers":"hover"};
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

	get reddit_upvotes_allow_hover() {
		return this.get("reddit_upvotes") != "removeentirely";
	}

	get reddit_modify_upvotes() {
		return this.get("reddit_upvotes") != "nochange";
	}

	get reddit_karma_allow_hover() {
		return this.get("reddit_karma") != "removeentirely";
	}

	get reddit_modify_karma() {
		return this.get("reddit_karma") != "nochange";
	}


	get twitter_followers_allow_hover() {
		return this.get("twitter_followers") != "removeentirely";
	}

	get twitter_modify_followers() {
		return this.get("twitter_followers") != "nochange";
	}
}

function initialize_static(settings_receiver) {
	chrome.storage.sync.get(null, function(settings_map) {
		var settings = new SettingsReader(settings_map);

		settings_receiver(settings);
	});
}

// initialize content script for a dynamic webpage
function initialize_dynamic(settings_receiver, monitor=null, ms=50) {
	initialize_static(function(settings) {
		//console.time("settings_receiver");
		//console.log("calling settings_receiver from initialize_dynamic");
		settings_receiver(settings);
		//console.timeEnd("settings_receiver");
		//console.log("calling bind_dynamic...");
		bind_dynamic(settings_receiver, monitor, ms);
	});
}

function bind_dynamic(settings_receiver, monitor=null, ms=50) {
	var observer = new MutationObserver(function(mutations) {
		//console.log("mutated-observed");
		this.disconnect();

		setTimeout(function() {
			//console.log("setTimeout");
			initialize_dynamic(settings_receiver, monitor, ms);
		}, ms);
	});

	var config = { attributes: true, childList: true, characterData: true, subtree: true };

	observer.observe(document.body /*monitor == null ? document : monitor*/, config);
	//console.log("observer observing...");
}

function unbind_dynamic_using_event(monitor=null) {
	$(monitor == null ? document : monitor).unbind('DOMSubtreeModified.event1');
}

// swap this so it can't miss
function bind_dynamic_using_event(settings_receiver, monitor=null, ms=50) {
	$(monitor == null ? document : monitor).one('DOMSubtreeModified.event1', function() {
		setTimeout(function() {
			initialize_dynamic(settings_receiver, monitor, ms);
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
