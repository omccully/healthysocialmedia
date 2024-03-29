// firefox
// "options_ui": { "page": "options.html" },

// chrome
// "options_page": "options.html",

function get_or_default(obj, key, default_value=undefined) {
  if(!obj.hasOwnProperty(key)) {
    return default_value;
  }
  return obj[key];
}

function has_attr(attr) {

}

// radio's name is settings key, value is value
function radio_settings_setter(jquery) {
  jquery.unbind().change(function() {
    if($(this).is(':checked')) {
      var val = $(this).val();
      var setting_key = $(this).attr('name');
      console.log("Setting " + setting_key + "=" + val);

      var set_obj = new Object();
      set_obj[setting_key] = val;
      chrome.storage.sync.set(set_obj, function() {
        //console.log("Set");
      })
    }
  });
}

function initialize_radiogroup(settings, group_name) {
  var group_query = "input[name='" + group_name + "']";

  var saved_val = settings[group_name];

  var checked = false;

  $(group_query).each(function() {
    if($(this).val() == saved_val) {
      $(this).prop("checked", true);
      checked = true;
    }
  });

  if(!checked) {
    // TODO: consider defaulting to the first option
    // set in storage when assumptions are made 
    $(group_query + "[default-checked]").first().prop("checked", true);
  }

  radio_settings_setter($("input[name='" + group_name + "']"));
}


// checkbox's id is settings key
function checkbox_settings_setter(jquery) {
  jquery.unbind().change(function() {
    var id = $(this).attr('id');
    var set_obj = new Object();
    set_obj[id] = this.checked;

    console.log("Setting " + id + "=" + this.checked);
    chrome.storage.sync.set(set_obj, function() {
      //console.log("Set");
    });
  });
}

function initialize_checkbox(settings, jquery) {
  // the element id is the settings key
  jquery.each(function() {
    var id = $(this).attr('id');
    if(settings.hasOwnProperty(id)) {
      this.checked = settings[id];
    } else if($(this).is("[default-checked")) {
      this.checked = true;
    
    }
  });

  checkbox_settings_setter(jquery);
}

function initialize_all_checkboxes(settings) {
  initialize_checkbox(settings, $("input[type='checkbox']"));
}

function initialize_all_radios(settings) {
  var radiogroup_names = [];
  $("input[type='radio']").each(function() {
    var name = $(this).attr("name");
    if(!radiogroup_names.includes(name)) {
      initialize_radiogroup(settings, name);
    }
  });
}

function initialize_all_selects(settings) {
  $("select").each(function() {
    var name = $(this).attr('name');

    if(settings.hasOwnProperty(name)) {
      $(this).val(settings[name]);
    } else {
      $(this).val($(this).find("[default-checked]").text());
    }

    $(this).unbind().change(function() {
      var set_obj = new Object();
      set_obj[name] = $(this).val();

      console.log("Setting " + name + "=" + set_obj[name]);
      chrome.storage.sync.set(set_obj, function() {
        //console.log("Set");
      });
    });
  });
}

function onclick_restore_defaults() {
  console.log("Restoring defaults");
  if(confirm("Are you sure you want to remove all of your custom settings " + 
      "for this extension and restore defaults?")) {
    console.log("Yes");
    chrome.storage.sync.clear(function() {
      location.reload();
    });
  }
}

function speed_list(obj, remove_normal = true) {
  return Object.entries(obj).filter(arr => !remove_normal || arr[1] != "Normal")
    .map(arr => arr[0] + ": " + arr[1] + (arr[1] != "Normal" ? "x" : ""))
    .join("<br/>");
}

function initialize_settings(settings) {
  initialize_all_checkboxes(settings);
  initialize_all_radios(settings);
  initialize_all_selects(settings);

  var settings_reader = new SettingsReader(settings);
  var channel_speeds = settings_reader.get("youtube_channel_speeds", {});
  var category_speeds = settings_reader.get("youtube_category_speeds", {});

  var html = "";
  if(Object.keys(channel_speeds).length) {
    html = "Channels:<br/>" + speed_list(channel_speeds) + "<br/><br/>";
  }
  if(Object.keys(category_speeds).length) {
    //if(html.length > 0) html += "<br/><br/>";
    html += "Categories:<br/>" + speed_list(category_speeds, false) + "<br/><br/>";
  }
  $("#youtube_speedmod_info").html(html);

  $("#restore_defaults_button").unbind().click(onclick_restore_defaults);

  $("#youtube_identity_info_guide").css("display", 
    settings.cache_youtube_channel_id ? "none" : "block");
  
  $("#youtube_identity_info").html("chid = " + settings.cache_youtube_channel_id + 
    ", cname = " + settings.cache_youtube_channel_name + 
    ", cuser = " + settings.cache_youtube_channel_user);
}

function initialize() {
  chrome.storage.sync.get(null, function(settings) {
    console.log("initializing settings page");
    //console.log(xinspect(settings));
    initialize_settings(settings);

    setTimeout(function() {
      initialize();
    }, 5000);
  });
}


initialize();


// GENERATE DEFAULTS:
/*
var defaults = {};
$("input[type='checkbox']").each(function() {
  defaults[$(this).attr("id")] = $(this).is("[default-checked]");
});

// TODO: get data structure of all valid values to radios
// if the value is ever invalid, use the default
$("input[type='radio'][default-checked]").each(function() {
  defaults[$(this).attr("name")] = $(this).attr("value");
});

$("select").each(function() {
  var name = $(this).attr("name");
  var defaultValue = $(this).find("option[default-checked]").text();
  defaults[name] = defaultValue;
});



console.log(JSON.stringify(defaults, null, 2));
*/
