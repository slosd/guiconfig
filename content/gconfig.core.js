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
	if(typeof preferences == "string") {
		var request = new XMLHttpRequest();
		request.open("GET", preferences, false); 
		request.send(null);
		var XML = request.responseXML;
		var DOC = XML.documentElement;
	}
	else if(typeof preferences == "object") {
		var DOC = preferences;
	}
	else {
		return false;
	}
		
	var Instance = function(doc, options) {
		var klass = this,
			options = (options || new Object()),
			Nodes = new Object,
			Filter = (options.filter || function() { return true; }),
			
			parse = function(children, container, alth) {
				children.forEach(function(child) {
					var nodeName = child.nodeName;
					var handler = alth || Nodes[nodeName];
					if(!handler || !Filter(child))
						return;
					else
						handler(child, container, parse);
				}, this);
				return container;
			};
		
		this.document = doc;
		
		this.registerNode = function(nodeName, fn, thisObj) {
			if(!fn)
				var fn = function(child, container, parse) {
					return parse(child.childNodes, container);
				};
			Nodes[nodeName] = fn.bind(thisObj);
		}
		this.registerNodes = function(nodeNames, fn, thisObj) {
			for(var i = 0, l = nodeNames.length; i < l; i++)
				this.registerNode(nodeNames[i], fn, thisObj);
		}
		this.run = function(container) {
			if(!container)
				var container = this.document;
			return parse(this.document.childNodes, container);
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

gcCore.RegExpNonLetters = new RegExp("["+
"0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0BE6-0BF20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F331040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-18191946-194F19D0-19D91B50-1B591BB0-1BB91C40-1C491C50-1C5920702074-20792080-20892153-21822185-21882460-249B24EA-24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293251-325F3280-328932B1-32BFA620-A629A8D0-A8D9A900-A909AA50-AA59FF10-FF190021-00230025-002A002C-002F003A003B003F0040005B-005D005F007B007D00A100AB00B700BB00BF037E0387055A-055F0589058A05BE05C005C305C605F305F40609060A060C060D061B061E061F066A-066D06D40700-070D07F7-07F90964096509700DF40E4F0E5A0E5B0F04-0F120F3A-0F3D0F850FD0-0FD4104A-104F10FB1361-1368166D166E169B169C16EB-16ED1735173617D4-17D617D8-17DA1800-180A1944194519DE19DF1A1E1A1F1B5A-1B601C3B-1C3F1C7E1C7F2010-20272030-20432045-20512053-205E207D207E208D208E2329232A2768-277527C527C627E6-27EF2983-299829D8-29DB29FC29FD2CF9-2CFC2CFE2CFF2E00-2E2E2E303001-30033008-30113014-301F3030303D30A030FBA60D-A60FA673A67EA874-A877A8CEA8CFA92EA92FA95FAA5C-AA5FFD3EFD3FFE10-FE19FE30-FE52FE54-FE61FE63FE68FE6AFE6BFF01-FF03FF05-FF0AFF0C-FF0FFF1AFF1BFF1FFF20FF3B-FF3DFF3FFF5BFF5DFF5F-FF650024002B003C-003E005E0060007C007E00A2-00A900AC00AE-00B100B400B600B800D700F702C2-02C502D2-02DF02E5-02EB02ED02EF-02FF03750384038503F604820606-0608060B060E060F06E906FD06FE07F609F209F309FA0AF10B700BF3-0BFA0C7F0CF10CF20D790E3F0F01-0F030F13-0F170F1A-0F1F0F340F360F380FBE-0FC50FC7-0FCC0FCE0FCF109E109F13601390-139917DB194019E0-19FF1B61-1B6A1B74-1B7C1FBD1FBF-1FC11FCD-1FCF1FDD-1FDF1FED-1FEF1FFD1FFE20442052207A-207C208A-208C20A0-20B5210021012103-21062108210921142116-2118211E-2123212521272129212E213A213B2140-2144214A-214D214F2190-2328232B-23E72400-24262440-244A249C-24E92500-269D26A0-26BC26C0-26C32701-27042706-2709270C-27272729-274B274D274F-275227562758-275E2761-276727942798-27AF27B1-27BE27C0-27C427C7-27CA27CC27D0-27E527F0-29822999-29D729DC-29FB29FE-2B4C2B50-2B542CE5-2CEA2E80-2E992E9B-2EF32F00-2FD52FF0-2FFB300430123013302030363037303E303F309B309C319031913196-319F31C0-31E33200-321E322A-324332503260-327F328A-32B032C0-32FE3300-33FF4DC0-4DFFA490-A4C6A700-A716A720A721A789A78AA828-A82BFB29FDFCFDFDFE62FE64-FE66FE69FF04FF0BFF1C-FF1EFF3EFF40FF5CFF5EFFE0-FFE6FFE8-FFEEFFFCFFFD0000-001F007F-009F00AD0600-060306DD070F17B417B5200B-200F202A-202E2060-2064206A-206FD800DB7FDB80DBFFDC00DFFFE000F8FFFEFFFFF9-FFFB002000A01680180E2000-200A20282029202F205F3000"
.replace(/(\w{4})/g, "\\u$1")+
"]", "g");

XULElement.prototype.setProperty = function(name, value) {
	if(this.hasAttribute(name))
		this[name] = value;
	else
		this.setAttribute(name, value);
}

NodeList.prototype.forEach = Array.prototype.forEach;

// node.setUserData and node.getUserData don't work in Firefox 2
try {
	document.setUserData("gcfix", 0, null);
}
catch(e) {
	gcCore.UserData = new Object;
	Element.prototype.setUserData = function(name, value) {
		var data;
		if(!is_defined(gcCore.UserData[this]))
			gcCore.UserData[this] = new Object;
		gcCore.UserData[this][name] = value;
	};
	Element.prototype.getUserData = function(name) {
		var data;
		if(is_defined(gcCore.UserData[this]) && is_defined(data = gcCore.UserData[this][name]))
			return data;
	};
}

// Using Function.prototype.bind caused problems in Firefox 2
(function(){}).constructor.prototype.bind = function(o) {
	return function(f) {
		return function() {
			var a = arguments;
			return f.apply(o, a);
		}
	}(this);
}

if(!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/(^\s+|\s+$)/, "");
	}
}

String.prototype.dostuff = function(n) {
	var s = this,
		r = new Array,
		l = Math.ceil(s.length/n);
	for(var i = 0; i < l; i++)
		r[r.length] = s.substr(i*n, n);
	return r;
}

String.prototype.makeSearchable = function(join_string) {
	if(!join_string)
		var join_string = " ";
	return this.trim().toLowerCase().replace(gcCore.RegExpNonLetters, " ").replace(/\s\s+/, " ").split(" ").sort().join(join_string);
}

function is_defined(obj) {
	return obj != null && typeof obj != "undefined";
}