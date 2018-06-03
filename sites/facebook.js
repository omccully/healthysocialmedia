console.log("facebook.js exec");

function url_to_account_id(url) {
	var regex = new RegExp('facebook\.com\/([^\?]+)');

	return url.match(regex)[1];
}

function logged_in_account_id() {
	var href = $("._2s25").first().attr("href");

	 return url_to_account_id(href);
}


function modify() {
	var account_id = logged_in_account_id();

	console.log("account_id = " + account_id);

	var reg = new RegExp('facebook\.com/' + account_id);
	var match = reg.test(window.location.href);
	if(match) {
		console.log("on home profile");
		var others_reg = new RegExp("[0-9]+ others");
		$("._4arz").each(function(i, liketext) {
			console.log($(liketext).html());
			$(liketext).html($(liketext).html().replace(others_reg, "some others"));
			console.log($(liketext).html());
			console.log("...");
		});

		// friend counts on profile sidebar
		$("._2iem").html("HSM");

		// friend counts on profile tab
		$("._gs6").html("HSM");

		// friend counts on friends page
		$("._3d0").html("HSM");
	}
}


function DOMModificationHandler(){
    $(this).unbind('DOMSubtreeModified.event1');
    setTimeout(function(){
        modify();
        // '#u_0_1r_story'
        $("body").bind('DOMSubtreeModified.event1',
                                   DOMModificationHandler);
    },10);
}


$("body").bind('DOMSubtreeModified.event1', DOMModificationHandler);
modify();


