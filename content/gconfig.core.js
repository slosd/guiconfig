var gcCore = {
	
	MozPrefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService),
	MozPrompt: Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService),
	MozInfo: Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo),
	MozRuntime: Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime),
	MozVersionComparator: Components.classes['@mozilla.org/xpcom/version-comparator;1'].getService(Components.interfaces.nsIVersionComparator),
	
	MozInterfaceFilePicker: Components.interfaces.nsIFilePicker,
	MozInstanceFilePicker: function(){ return Components.classes["@mozilla.org/filepicker;1"].createInstance(this.MozInterfaceFilePicker); }
	
}

gcCore.MozPreferences = gcCore.MozPrefs.getBranch(null);
gcCore.GCPreferences = gcCore.MozPrefs.getBranch("extensions.guiconfig.");

gcCore.MozPrefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
gcCore.MozPrefs.addObserver("", gcCore, false);

gcCore.Observers = new Object;
gcCore.addObserver = function(branch, fn, bind, id) {
	if(!this.Observers[branch]) {
		this.Observers[branch] = new Object;
	}
	this.Observers[branch][(id || "default")] = { 'fn': fn, 'bind': bind, 'observe': true };
	return true;
}
gcCore.startObserver = function(branch, id) {
	this.Observers[branch][(id || "default")].observe = true;
}
gcCore.stopObserver = function(branch, id) {
	this.Observers[branch][(id || "default")].observe = false;
}

gcCore.observe = function(subject, topic, data) {
	if(topic != "nsPref:changed")
		return;
	if(this.Observers[data]) {
		var callback, observer = this.Observers[data];
		for(var id in observer) {
			callback = observer[id];
			if(callback.observe)
				callback.fn.call((callback.bind || callback.fn), data);
		}
	}
}

gcCore.PrefParser = function(preferences) {
	var request = new XMLHttpRequest();
	request.open("GET", preferences, false); 
	request.send(null);
	var XML = request.responseXML;
	var DOC = XML.documentElement;
		
	var Instance = function(doc, options) {
		var klass = this,
			options = (options || new Object()),
			Nodes = new Object,
			Filter = (options.filter || function() { return true; }),
			
			parse = function(children, container) {
				children.forEach(function(child) {
					var nodeName = child.nodeName;
					if(!Nodes[nodeName] || !Filter(child))
						return;
					else
						Nodes[nodeName].fn.call(Nodes[nodeName].thisObj, child, container, parse);
				}, this);
				return container;
			};
		
		this.document = doc;
		
		this.registerNode = function(nodeName, fn, thisObj) {
			if(!fn)
				var fn = function(child, container, parse) {
					return parse(child.childNodes, container);
				};
			Nodes[nodeName] = { "fn": fn, "thisObj": thisObj };
		}
		this.registerNodes = function(nodeNames, fn, thisObj) {
			nodeNames.forEach(function(nodeName) {
				this.registerNode(nodeName, fn, thisObj);
			}, klass);
		}
		this.run = function(container) {
			if(!container)
				var container = this.document;
			parse(this.document.childNodes, container);
		}
	}
	
	this.instance = function(options) {
		var instance = new Instance(DOC, options);
		return instance;
	}
}

gcCore.IconSet = function(theme, options) {
	this.theme = (theme || "tango");
	this.Options = (options || { os: false });
	this.icons = new Object;
	this.getIcons();
}
gcCore.IconSet.prototype.getIcons = function() {
	var actions_path = "chrome://guiconfig/skin/" + this.theme + "/actions/";
	var tab_icons_path = "chrome://guiconfig/skin/" + this.theme + "/tab_icons/";
	var moz_stock = "moz-icon://stock/";

	switch(this.Options.os) {
		case 'Linux':
				if(gcCore.MozInfo.version.indexOf("3") == 0) {
					this.addIcon("add", moz_stock + "gtk-add?size=button");
					this.addIcon("color", moz_stock + "gtk-color-picker?size=button");
					this.addIcon("reset", moz_stock + "gtk-undo?size=menu");
				}
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
	this.addIcon("tab_network", tab_icons_path + "network.png");
	this.addIcon("tab_style", tab_icons_path + "style.png");
}
gcCore.IconSet.prototype.addIcon = function(name, path) {
	if(!this.icons[name])
		this.icons[name] = path;
}
gcCore.IconSet.prototype.getIcon = function(name) {
	return this.icons[name];
}
gcCore.IconSet.prototype.iconExists = function(name) {
	return !!this.icons[name];
}

gcCore.validateVersion = function(version, min, max) {	
	if(min && gcCore.MozVersionComparator.compare(gcCore.MozInfo.version, min) == -1
	|| max && gcCore.MozVersionComparator.compare(gcCore.MozInfo.version, max) == 1)
		return false;
	return true;
}

gcCore.userInput = function(title, label) {
	var input = {
		value: ""
	};

	var check = {
		value: false
	};

	var change_value = this.MozPrompt.prompt(null, title, label, input, null, check);

	if(change_value && input.value != "")
		return input.value;
	else
		return null;
}
	
gcCore.userConfirm = function(title, text, checkLabel, checkDefault) {
	var checked = { "value": checkDefault }
	var response = this.MozPrompt.confirmCheck(null, title, text, checkLabel, checked);
	return { "value": response, "checked": checked.value };
}

gcCore.fileInput = function(title, filters) {
	var fp = this.MozInstanceFilePicker();
	fp.init(window, title, this.MozInterfaceFilePicker.modeOpen);
	for(var i = 0, l = filters.length; i < l; i++)
		if(this.MozInterfaceFilePicker[filters[i]])
			fp.appendFilters(this.MozInterfaceFilePicker[filters[i]]);
	var status = fp.show();
	if (status == this.MozInterfaceFilePicker.returnOK)
		return fp.file;
	else
		return false;
}


XULElement.prototype.setProperty = function(name, value) {
	if(this.hasAttribute(name))
		this[name] = value;
	else
		this.setAttribute(name, value);
}

NodeList.prototype.forEach = Array.prototype.forEach;

Function.prototype.bind = function(o) {
	var f = this;
	return function() {
		return function() {
			var a = arguments;
			return f.apply(o, a);
		}
	}();
}

if(!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/(^\s+|\s+$)/, "");
	}
}

String.prototype.makeSearchable = function(join_string) {
	if(!join_string)
		var join_string = " ";
	//TODO make non-letters matches more convenient
	return this.trim().toLowerCase().replace(/[0-9\"\'\«\»\(\)\<\>\-\_\,\.\;\:]/gi, "").replace(/\s\s+/, " ").split(" ").sort().join(join_string);
}