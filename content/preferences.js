var fn_clear = {
	type: "Char",
	setPref: function(value) {
		this.Preference[value ? "setPref" : "resetPref"]("");
		return false;
	},
	getPref: function() {
		return (this.Preference.getPref() == "");
	}
};

Option.customBinding("browser.urlbar.restrict.tag", fn_clear);

Option.customBinding("browser.urlbar.restrict.history", fn_clear);

Option.customBinding("browser.urlbar.restrict.bookmark", fn_clear);

Option.customBinding("browser.urlbar.match.url", fn_clear);

Option.customBinding("browser.urlbar.match.title", fn_clear);