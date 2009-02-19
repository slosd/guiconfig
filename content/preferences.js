Preference.customBinding("guiconfig.urlbar.restrict", {
	setPref: function(value) {
		var bindings = this.Options.bindings;
		for(var i = 0; i < 3; i++) {
			if(i == value)
				bindings[i].setPref("");
			else
				bindings[i].reset();
		}
	}
});

Preference.customBinding("guiconfig.urlbar.match", {
	setPref: function(value) {
		var bindings = this.Options.bindings;
		for(var i = 0; i < 2; i++) {
			if(i == value)
				bindings[i].setPref("");
			else
				bindings[i].reset();
		}
	}
});