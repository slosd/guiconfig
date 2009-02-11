var guiconfig = {
	
	opt_locale: document.getElementById("opt_locale"),
	gc_locale: document.getElementById("gc_locale"),
	
	pref: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService),
	prompts: Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService),
	appinfo: Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo),
	runtime: Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime),
	
	queue: new Array,
	stop_option_observation: false,
	created_preferences: false,
	option_num: 0,
	valid_options: new Array,
	icons: new Array,
	
	init: function() {
		this.getIcons();
		this.getConfiguration();
		this.getElements();
		this.setButtons();
		this.buildRightClickMenu({
			"reset": function() {
				guiconfig.setPrefToDefault(guiconfig.active_option);
			}
		});
		this.createPreferences();

		/*for(var i in this.appinfo)
			console.log(i + " = '" + this.appinfo[i] + "'");*/

		//TODO find a convenient way to center the config.xul window
		window.setTimeout(function() {
			guiconfig.window.centerWindowOnScreen();
		}, 200);
	},
	
	/*addToQueue: function(action) {
		if(this.usrpref.getBoolPref("browser.preferences.instantApply") == true)
			return action();
		this.queue.include((function(f) {
			return f;
		})(action));
	},
	
	executeQueue: function() {
		for(var i = 0; i < this.queue.length; i++)
			this.queue[i]();
	},*/

	getIcons: function() {
		var actions_path = "chrome://guiconfig/skin/actions/";
		var tab_icons_path = "chrome://guiconfig/skin/tab_icons/";
		var moz_stock = "moz-icon://stock/";

		switch(this.runtime.OS) {
			case 'Linux':
				this.addIcon("add", moz_stock + "gtk-add?size=button");
				this.addIcon("color", moz_stock + "gtk-color-picker?size=button");
				this.addIcon("reset", moz_stock + "gtk-undo?size=menu");
				break;

			case 'WINNT': break;
		}
		this.addIcon("add", actions_path + "add.png");
		this.addIcon("color", actions_path + "color.png");
		this.addIcon("reset", actions_path + "reset.png");
		this.addIcon("tab_accessibility", tab_icons_path + "accessibility.png");
		this.addIcon("tab_bookmarks", tab_icons_path + "bookmarks.png");
		this.addIcon("tab_browser", tab_icons_path + "browser.png");
		this.addIcon("tab_developing", tab_icons_path + "developing.png");
		this.addIcon("tab_downloads", tab_icons_path + "downloads.png");
		this.addIcon("tab_style", tab_icons_path + "style.png");
	},

	addIcon: function(name, path) {
		if(!$defined(this.icons[name]))
			this.icons[name] = path;
	},

	getConfiguration: function() {
		this.usrpref = this.pref.getBranch("");
		this.extpref = this.pref.getBranch("extensions.guiconfig.");
	},

	getElements: function() {
		this.tabpanels = document.getElementById("gcConfigContainer");
		this.tabs = document.getElementById("gcConfigTabs");
		this.description = document.getElementById("gcConfigDescription");
		this.window = document.getElementById("gcConfigWindow");
	},

	setButtons: function() {
		if(this.usrpref.getBoolPref("browser.preferences.instantApply") == true) {
			this.window.buttons = "cancel,extra1";
			var button = this.window.getButton("cancel");
			button.setAttribute("label", this.getgcLocaleString("close"));
			button.setAttribute("icon", "close");
		}
		else {
			this.window.buttons = "accept,cancel,extra1";
			var button = this.window.getButton("cancel");
			button.setAttribute("label", this.getgcLocaleString("cancel"));
			button.setAttribute("icon", "cancel");
		}
	},

	getgcLocaleString: function(n) {
		try {
			return this.gc_locale.getString(n);
		}
		catch (e) {
			return "";
		}
	},

	getLocaleString: function(n) {
		try {
			return this.opt_locale.getString(n);
		}
		catch (e) {
			return "";
		}
	},

	getSelectLocaleStrings: function(opt, c) {
		var e;
		var a = new Array();
		var n = opt.key.replace(/\./g, "_");

		for (var i = 1; i <= c; i++) {
			e = this.getLocaleString(n + "_o" + i);

			if(e != null)
				a[a.length] = e;
		}

		return a;
	},

	resetToDefault: function() {
		if(!this.extpref.getBoolPref("todefault.ask")) {
			this.resetPreferences(true);
			return true;
		}
		var dont_ask = {
			value: false
		};

		var reset_options =
			this.prompts.confirmCheck(null, "gui:config", this.getLocaleString("confirm-std"),
				this.getLocaleString("dont-ask"), dont_ask);

		if(reset_options == true) {
			this.resetPreferences(true);
			this.extpref.setBoolPref("todefault.ask", !dont_ask.value);
		}
		return reset_options;
	},

	setPrefToDefault: function(opt) {
		guiconfig.resetOption(opt);
		guiconfig.updateOption(opt);
		return true;
	},

	optionHandler: function(opt, type, value) {
		if(typeof opt[type] == "function")
			return opt[type](opt, value);

		else if(typeof opt.handle[type] == "function")
			return opt.handle[type](opt, value);

		else
			return null;
	},

	optionExists: function(opt) {
		return !!this.optionHandler(opt, "exists");
	},

	getOption: function(opt) {
		return this.optionHandler(opt, "get");
	},

	getOptionValue: function(opt) {
		return this.optionHandler(opt, "value");
	},

	setOptionValue: function(opt, value) {
		return this.optionHandler(opt, "value", value);
	},

	createOptionElement: function(opt) {
		return this.optionHandler(opt, "write");
	},

	setOption: function(opt, value) {
		return this.optionHandler(opt, "set", $pick(value, this.getOptionValue(opt)));
	},

	resetOption: function(opt) {
		return this.optionHandler(opt, "reset");
	},

	onOptChange: function(opt) {
		this.stop_option_observation = true;
		if(this.usrpref.getBoolPref("browser.preferences.instantApply"))
			this.setOption(opt);
		this.stop_option_observation = false;
	},

	savePreferences: function() {
		//this.executeQueue();
		return this.setPreferences(false);
	},

	resetPreferences: function() {
		return this.setPreferences(true);
	},

	setPreferences: function(reset) {
		var option;

		for (var key in this.valid_options) {
			option = this.valid_options[key];

			if(!option.disabled)
				(reset) ? this.resetOption(option) : (this.optionExists(option)) ? this.saveOption(option) : null;
		}
		return true;
	},

	createOption: function(opt) {
		this.setOption(opt, "");
		this.updateOption(opt);
		return true;
	},

	saveOption: function(opt) {
		this.setOption(opt);
		this.updateOption(opt);
		return true;
	},

	updateOption: function(opt) {
		var optObject = this.buildOption(opt, true);
		var optBox = document.getElementById(opt.key).parentNode.parentNode;
		optBox.parentNode.insertBefore(optObject, optBox);
		optBox.parentNode.removeChild(optBox);
		return true;
	},

	observeOption: function(key) {
		var option;
		
		if(this.stop_option_observation)
			return false;
		
		for (var key in valid_options) {
			option = this.valid_options[key];

			if(option.key == key)
				return this.updateOption(option);
		}

		return false;
	},

	addOptButton: function(name, opt, elements) {
		var button = document.createElement("button");
		button.setAttribute("class", "hOptions");

		switch(name) {
			case 'edit':
				opt.button_edit = true;
				button.setAttribute("label", this.getLocaleString("button-edit-enable"));
				button.setAttribute("image", this.icons["add"]);
				button.addEventListener("click", function() {
					opt.button_edit = false;
					guiconfig.enable(button, opt, elements);
				}, false);
				break;

			case 'color':
				opt.button_color = true;
				button.setAttribute("label", this.getLocaleString("button-custom-value"));
				button.setAttribute("image", this.icons["color"]);
				button.addEventListener("click", function() {
					opt.button_color = false;
					guiconfig.colorValue(button, opt, elements);
				}, false);
				break;
		}
		return button;
	},

	enable: function(button, opt, elements) {
		if(this.optionExists(opt))
			return false;
			
		button.parentNode.removeChild(button);

		for (var i = 0; i < elements.length; i++)
			elements[i].setAttribute("disabled", false);

		return guiconfig.createOption(opt);
	},

	colorValue: function(button, opt, elements) {
		var input = {
			value: ""
		};

		var check = {
			value: false
		};

		var change_value =
			this.prompts.prompt(null, "gui:config", this.getLocaleString("fill-in-value"), input, null, check);

		if(change_value && input.value != "") {
			this.enable(button, opt, elements);
			return this.setOption(opt, input.value);
		}
		return false;
	},

	validateOption: function(opt) {
		if(!this.extpref.getBoolPref("matchversion"))
			return true;
		else
			return new RegExp("^" + (opt.version || ".*") + "$").test(this.appinfo.version);
	},

	createPreferences: function() {
		var main_group, groupTab;

		for (var i = 0; i < this.options.length; i++) {
			main_group = this.options[i];

			groupTab = document.createElement("radio");
			groupTab.setAttribute("label", this.getLocaleString(main_group.label));
			groupTab.setAttribute("src", this.icons["tab_" + main_group.label]);
			groupTab.setAttribute("pane", i);
			groupTab.addEventListener("command", this.switchPanel, false);

			if(i == 0)
				groupTab.setAttribute("selected", true);

			this.tabs.appendChild(groupTab);
			this.tabpanels.appendChild(this.goThroughGroup(main_group.content));
		}

		this.created_preferences = true;
		return true;
	},

	goThroughGroup: function(group_content) {
		var group;
		var option, option_element;

		var group_tabs, tabbox, tabs, tabpanels, tab, tabpanel, tabpanelbox;
		var group_tabs_created = false;

		var subgroup_name, subgroupBox, subgroupCaption;

		var element;

		var GroupBox = document.createElement("vbox");
		GroupBox.setAttribute("class", "gcPrefPane");
		GroupBox.setAttribute("flex", "1");

		for (var i = 0; i < group_content.length; i++) {

			/* it's a group */
			if(this.isGroup(group_content[i])) {

				group = group_content[i];

				/* validate whole group */
				if(!this.validateOption(group))
					continue;

				/* display groups as tabs */
				if(group.tab) {

					/* create a new tabgroup */
					if(!group_tabs_created) {
						tabbox = document.createElement("tabbox");
						tabbox.setAttribute("flex", "1");
						tabs = document.createElement("tabs");
						tabpanels = document.createElement("tabpanels");
						tabpanels.setAttribute("flex", "1");
						tabbox.appendChild(tabs);
						tabbox.appendChild(tabpanels);
						group_tabs_created = true;

						GroupBox.appendChild(tabbox);
					}

					/* add group to an existing tabgroup */
					tab = document.createElement("tab");
					tab.setAttribute("label", this.getLocaleString(group.label));
					tabpanel = document.createElement("tabpanel");
					tabpanel.appendChild(this.goThroughGroup(group.content));
					tabs.appendChild(tab);
					tabpanels.appendChild(tabpanel);
				}

				/* display groups as groupboxes */
				else {

					group_tabs_created = false;

					subgroupBox = document.createElement("groupbox");
					//subgroupBox.setAttribute("flex", "1");

					if(group.label != "") {
						subgroupCaption = document.createElement("caption");
						subgroupCaption.setAttribute("label", this.getLocaleString(group.label));
						subgroupBox.appendChild(subgroupCaption);
					}

					subgroupBox.appendChild(this.goThroughGroup(group.content));

					GroupBox.appendChild(subgroupBox);
				}
			}

			/* it's an option */
			else if(this.isOption(group_content[i])) {

				option = group_content[i];
				option_element = this.buildOption(option);

				if(!option_element || option.disabled)
					continue;
				
				this.valid_options[option.key] = option;
				this.option_num++;

				GroupBox.appendChild(option_element);
			}
			else if(this.isElement(group_content[i])) {
				switch(group_content[i].element) {
					case 'space':
						element = document.createElement("separator");
						break;
				}

				if(element)
					GroupBox.appendChild(element);
			}
		}

		return GroupBox;
	},

	isGroup: function(content) {
		return($defined(content.label) && $defined(content.content));
	},

	isOption: function(content) {
		return($defined(content.key) && $defined(content.handle));
	},

	isElement: function(content) {
		return($defined(content.element));
	},

	setDescription: function(txt) {
		if(txt == this.description.firstChild.data)
			return false;
		var t = document.createTextNode(txt);
		this.description.replaceChild(t, this.description.firstChild);
		return true;
	},

	switchPanel: function() {
		guiconfig.tabpanels.selectedIndex = this.getAttribute("pane");
		return true;
	},

	addTextboxEvents: function(textbox, opt) {
		textbox.addEventListener("keydown", function() {
			if(guiconfig.timeout)
				window.clearTimeout(guiconfig.timeout);
		}, false);
		textbox.addEventListener("keyup", function() {
			guiconfig.timeout = window.setTimeout(function() {
				guiconfig.onOptChange(opt);
			}, 700);
		}, false);
	},

	setBindings: function(opt, type, value) {
		switch(typeof opt.bind) {
			case "array":
				for (var i = 0; i < opt.bind.length; i++)
					guiconfig.usrpref[type](opt.bind[i], value);
			break;
			case "string":
				guiconfig.usrpref[type](opt.bind, value);
			break;
			default:
				return false;
			break;
		}
		return true;
	},

	buildRightClickMenu: function(f) {
		var value, menu = document.getElementById("gcoptrightclick"), menuitems = menu.childNodes;
				
		for (var i = 0; i < menuitems.length; i++) {
			value = menuitems[i].getAttribute("value");

			if($defined(f[value]))
				menuitems[i].onclick = f[value];

			if($defined(this.icons[value]))
				menuitems[i].style.listStyleImage = "url(" + this.icons[value] + ")";
		}

		return menu;
	},

	buildSelect: function(opt, value) {
		var s = new Array, values = this.getSelectLocaleStrings(opt, opt.allowed.length);
	
		for (var i = 0; i < opt.allowed.length; i++) {
			s.include([values[i], opt.allowed[i], (opt.allowed[i] == value)]);
		}
		
		return s.toMenuList(opt, value);
	},

	buildOption: function(opt, ignore_validation) {
		if(!this.validateOption(opt) && !ignore_validation)
			return false;
	
		opt.name = this.getLocaleString(opt.key.replace(/\./g, "_") + "_name");
		opt.description = this.getLocaleString(opt.key.replace(/\./g, "_") + "_description");
	
		var optElements = this.createOptionElement(opt);
	
		var optRow = document.createElement("hbox");
		optRow.setAttribute("context", "gcoptrightclick");
		optRow.setAttribute("class", "optionRow");
		optRow.setAttribute("align", "center");
	
		var optBox = document.createElement("hbox");
		optBox.setAttribute("flex", "1");
		optBox.gc_opt = opt;
		var buttonBox = document.createElement("hbox");
	
		if(opt.indent && !isNaN(opt.indent)) {
			var marginLeft = opt.indent * 23;
			optBox.setAttribute("style", "margin-left: " + marginLeft + "px");
		}
	
		optBox.addEventListener("mouseover", function(e) {
			guiconfig.active_option = e.currentTarget.gc_opt;
			guiconfig.setDescription(opt.description);
		}, false);
	
		for (var i = 0; i < optElements.option.length; i++)
			optBox.appendChild(optElements.option[i]);
	
		for (var i = 0; i < optElements.buttons.length; i++)
			buttonBox.appendChild(optElements.buttons[i]);
		
		optRow.appendChild(optBox);
		
		if(optElements.buttons.length > 0)
			optRow.appendChild(buttonBox);
	
		return optRow;
	}
}

/************************************************************************************************************************/

Array.prototype.toMenuList = function(opt, value) {
	var mi, ml = document.createElement("menulist"), id = opt.key;

	if(value == null)
		ml.setAttribute("disabled", true);

	if(id)
		ml.setAttribute("id", id);
	var mp = document.createElement("menupopup");

	for (var i = 0; i < this.length; i++) {
		mi = document.createElement("menuitem");
		mi.setAttribute("label", this[i][0]);
		mi.setAttribute("value", this[i][1]);

		if(this[i][2] == true)
			mi.setAttribute("selected", true);
		mi.setAttribute("crop", "end");
		mp.appendChild(mi);
	}
	ml.appendChild(mp);
	return ml;
}

Array.prototype.include = function() {
	for (var i = 0; i < arguments.length; i++)
		this[this.length] = arguments[i];

	return this;
}

var $pick = function() {
	for (var i = 0; i < arguments.length; i++)
		if($defined(arguments[i]))
			return arguments[i];

	return arguments[arguments.length-1];
}

var $defined = function(a) {
	return( typeof a != "undefined" && a != null);
}