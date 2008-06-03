var guiconfig = {
	locale : document.getElementById("gc_locale"),
	pref : Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService),

	initialize : function() {
		this.extpref = this.pref.getBranch("extensions.guiconfig.");
	}

}
guiconfig.initialize();