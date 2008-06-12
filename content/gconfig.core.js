var guiconfig = {

	locale : document.getElementById("gc_locale"),
	pref : Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService),
	prompts : Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService),
	appinfo : Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo),

	init : function() {
		this.extpref = this.pref.getBranch("extensions.guiconfig.");
		this.tabpanels = document.getElementById("gcConfigContainer");
		this.tabs = document.getElementById("gcConfigTabs");
		this.descr = document.getElementById("gcConfigDescription");
		this.window = document.getElementById("gcConfigWindow");
		var nr = this.createPreferences();
		window.setTimeout(function() {
			guiconfig.window.centerWindowOnScreen();
		}, 10);
	},
	getLocaleString : function(n) {
		try {
			return this.locale.getString(n);
		} catch (e) {
			return "";
		}
	},
	getSelectLocaleStrings : function(opt, c) {
		var e;
		var a = new Array();
		var n = opt.key.replace(/\./g, "_");
		for (var i = 1; i <= c; i++) {
			e = this.getLocaleString(n + "_o" + i);
			if (e != null)
				a[a.length] = e;
		}
		return a;
	},
	addOptButton : function(name, opt, elements) {
		var button = document.createElement("button");
		button.setAttribute("class", "hOptions");
		switch (name) {
			case 'edit' :
				button.setAttribute("label", this
						.getLocaleString("button-edit-enable"));
				button.setAttribute("image", "chrome://guiconfig/skin/actions/add.png");
				button.addEventListener("click", function() {
					guiconfig.enable(button, opt, elements);
				}, false);
				break;
		}
		return button;
	},
	enable : function(button, opt, elements) {
		button.parentNode.removeChild(button);
		for (var i = 0; i < elements.length; i++)
			elements[i].setAttribute("disabled", false);
		return guiconfig.createOption(opt);
	},
	createOption : function(opt) {
		opt.handle.set(opt, "");
		this.updateOption(opt);
		return true;
	},
	saveOption : function(opt) {
		if (!this.validateOption(opt))
			return false;
		opt.handle.set(opt, opt.handle.value(opt))
		this.updateOption(opt);
		return false;
	},
	resetOption : function(opt) {
		if (!this.validateOption(opt))
			return false;
		opt.handle.reset(opt);
		this.updateOption(opt);
		return false;
	},
	resetToDefault : function() {
		if (!this.extpref.getBoolPref("todefault.ask")) {
			this.resetPreferences(true);
			return true;
		}
		var dont_ask = {
			value : false
		};
		var reset_options = this.prompts.confirmCheck(null, "gui:config", this
				.getLocaleString("confirm-std"), this
				.getLocaleString("dont-ask"), dont_ask);
		if (reset_options == true) {
			this.resetPreferences(true);
			this.extpref.setBoolPref("todefault.ask", !dont_ask.value);
		}
		return reset_options;
	},
	setPrefToDefault : function(opt) {
		guiconfig.resetOption(opt);
		guiconfig.updateOption(opt);
		return true;
	},
	buildRightClickMenu : function(opt, f) {
		var menu = document.getElementById("gcrightclick_prototype")
				.cloneNode(true);
		menu.setAttribute("id", opt.key + "_menu");
		var list = menu.childNodes;
		for (var i = 0; i < list.length; i++) {
			switch (list[i].getAttribute("value")) {
				case 'default' :
					list[i].onclick = f["default"];
					break;
			}
		}
		return menu;
	},
	savePreferences : function() {
		return this.setPreferences(false);
	},
	resetPreferences : function() {
		return this.setPreferences(true);
	},
	setPreferences : function(std) {
		var group, opt;
		var prefConfig = this.options;
		for (var i = 0; i < prefConfig.length; i++) {
			group = prefConfig[i];
			for (var e = 1; e < group.length; e++) {
				if (group[e][0] && group[e][0]["label"]) {
					for (var g = 1; g < group[e].length; g++) {
						opt = group[e][g];
						if (!opt.disabled)
							(std) ? this.resetOption(opt) : this
									.saveOption(opt);
					}
					continue;
				} else {
					opt = group[e];
					if (!opt.disabled)
						(std) ? this.resetOption(opt) : this.saveOption(opt);
				}
			}
		}
		this.prompts.alert(null, "gui:config", this
				.getLocaleString("alert-saved"));
		return false;
	},
	// updatePreferences : function() {
	// var tabs = this.tabs.childNodes;
	// var tabpanels = this.tabpanels.childNodes;
	// for(var i = 0; i < tabs.length; i++)
	// tabs[i].parentNode.removeChild(tabs[i]);
	// for(var i = 0; i < tabpanels.length; i++)
	// tabpanels[i].parentNode.removeChild(tabpanels[i]);
	// return this.createProperties();
	// },
	setDescription : function(txt) {
		if (txt == this.descr.firstChild.data)
			return false;
		var t = document.createTextNode(txt);
		this.descr.replaceChild(t, this.descr.firstChild);
		return true;
	},
	switchPanel : function() {
		guiconfig.tabpanels.selectedIndex = this.getAttribute("pane");
		return true;
	},
	createPreferences : function() {
		var group, group_name, groupTab, groupPanel, groupBox, subgroup_name, subgroupBox, subgroupCaption, opt, optObject, newOption;
		var options_num = 0;
		var prefConfig = this.options;
		for (var i = 0; i < prefConfig.length; i++) {
			group = prefConfig[i];

			groupTab = document.createElement("radio");
			groupTab.setAttribute("label", this
					.getLocaleString(group[0]["label"]));
			groupTab.setAttribute("src", "chrome://guiconfig/skin/tab_icons/"
					+ group[0]["icon"]);
			groupTab.setAttribute("pane", i);
			groupTab.addEventListener("command", this.switchPanel, false);
			if (i == 0)
				groupTab.setAttribute("selected", true);

			groupBox = document.createElement("groupbox");
			groupBox.setAttribute("orient", "vertical");
			groupBox.setAttribute("class", "optionGroup");
			groupBox.setAttribute("flex", "1");

			for (var e = 1; e < group.length; e++) {
				if (group[e][0] && group[e][0]["label"]) {
					subgroup_name = group[e][0]["label"];

					subgroupBox = document.createElement("groupbox");
					subgroupBox.setAttribute("class", "subgroup");
					subgroupBox.setAttribute("flex", "1");

					subgroupCaption = document.createElement("caption");
					subgroupCaption.setAttribute("label", this
							.getLocaleString(subgroup_name));
					subgroupBox.appendChild(subgroupCaption);

					for (var g = 1; g < group[e].length; g++) {
						opt = group[e][g];
						optObject = this.buildOption(opt);
						if (!optObject || opt.disabled)
							continue;
						subgroupBox.appendChild(optObject);
						options_num++;
					}
					newOption = subgroupBox;
				} else {
					opt = group[e];
					optObject = this.buildOption(opt);
					if (!optObject || opt.disabled)
						continue;
					options_num++;
					newOption = optObject;
				}
				groupBox.appendChild(newOption);
			}
			this.tabpanels.appendChild(groupBox);
			this.tabs.appendChild(groupTab);
		}
		return options_num;
	},
	validateOption : function(opt) {
		if (!this.extpref.getBoolPref("matchversion"))
			return true;
		else
			return this.appinfo.version.match(new RegExp("^"
					+ (opt.version || ".*") + "$"));
	},
	updateOption : function(opt) {
		var optObject = this.buildOption(opt, true);
		var optBox = document.getElementById(opt.key).parentNode;
		optBox.parentNode.insertBefore(optObject, optBox);
		optBox.parentNode.removeChild(optBox);
		return true;
	},
	buildOption : function(opt, ignore_validation) {
		if (!this.validateOption(opt) && !ignore_validation)
			return false;

		opt.name = this.getLocaleString(opt.key.replace(/\./g, "_") + "_name");
		opt.description = this.getLocaleString(opt.key.replace(/\./g, "_")
				+ "_description");

		var optElements = opt.handle.write(opt);
		var optBox = document.createElement("hbox");
		optBox.setAttribute("context", opt.key + "_menu");
		optBox.setAttribute("class", "optionRow");
		optBox.addEventListener("mouseover", function() {
			guiconfig.setDescription(opt.description);
		}, false);

		this.window.appendChild(guiconfig.buildRightClickMenu(opt, {
			"default" : function() {
				guiconfig.setPrefToDefault(opt);
			}
		}));

		for (var i = 0; i < optElements.length; i++) {
			if (optElements[i])
				optBox.appendChild(optElements[i]);
		}
		return optBox;
	},
	tryPref : function(opt) {
		return opt.handle.get(opt);
	},
	buildSelect : function(opt, value) {
		opt.values = this.getSelectLocaleStrings(opt, opt.allowed.length);
		var s = [];
		for (var i = 0; i < opt.allowed.length; i++) {
			s[s.length] = [opt.values[i], opt.allowed[i],
					(opt.allowed[i] == value)];
		}
		return s.toMenuList(opt.key, value);
	}
}
Array.prototype.toMenuList = function(id, value) {
	var mi;
	var ml = document.createElement("menulist");
	if (value == null)
		ml.setAttribute("disabled", true);
	if (id)
		ml.setAttribute("id", id);
	var mp = document.createElement("menupopup");
	for (var i = 0; i < this.length; i++) {
		mi = document.createElement("menuitem");
		mi.setAttribute("label", this[i][0]);
		mi.setAttribute("value", this[i][1]);
		if (this[i][2] == true)
			mi.setAttribute("selected", true);
		mi.setAttribute("crop", "end");
		mp.appendChild(mi);
	}
	ml.appendChild(mp);
	return ml;
}
guiconfig.options = new Array;