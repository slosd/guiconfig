var fn_clear = {
	type: "Char",
	setPref: function(value) {
		this[value ? "setCustomPref" : "reset"](this.Bind.type, "");
		return false;
	},
	getPref: function() {
		return this.getCustomPref(this.Bind.type) == "";
	}
};

Preference.customBinding("browser.urlbar.restrict.tag", fn_clear);

Preference.customBinding("browser.urlbar.restrict.history", fn_clear);

Preference.customBinding("browser.urlbar.restrict.bookmark", fn_clear);

Preference.customBinding("browser.urlbar.match.url", fn_clear);

Preference.customBinding("browser.urlbar.match.title", fn_clear);