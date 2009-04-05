var $defined = function(a) {
	return (typeof a != "undefined" && a != null);
}

var __ = function() {
	for(var i = 0, l = arguments.length; i < l; i++)
		switch(typeof arguments[i]) {
			case "undefined":
				break;
			case "function":
				try { var r = arguments[i](); } catch(e) { break; }
				return r;
				break;
			default:
				if(arguments[i] != null)
					return arguments[i];
				break;
		}
	return null;
}

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
		if($defined(this.MozInterfaceFilePicker[filters[i]]))
			fp.appendFilters(this.MozInterfaceFilePicker[filters[i]]);
	var status = fp.show();
	if (status == this.MozInterfaceFilePicker.returnOK)
		return fp.file;
	else
		return false;
}