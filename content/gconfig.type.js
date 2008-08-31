guiconfig.__proto__ = {
	boolean: {
		write : function(obj) {
			var elements = {
				option: new Array,
				buttons: new Array
			}
			
			var value = guiconfig.tryPref(obj);
			var c = document.createElement("checkbox");
			if (value != null)
				c.setAttribute("checked", value);
			else {
				c.setAttribute("disabled", true);
				elements.buttons.include(guiconfig.addOptButton("edit", obj, [c]));
			}
			c.setAttribute("label", obj.name);
			c.setAttribute("id", obj.key);
			c.addEventListener("command", function() {
				guiconfig.onOptChange(obj);
			}, false);
			
			elements.option.include(c);
			return elements;
		},
		get : function(obj) {
			try {
				return guiconfig.usrpref.getBoolPref(obj.key);
			} catch (e) {
				return null;
			}
		},
		set : function(obj, value) {
			if (value == null)
				return false;
			guiconfig.pref.setBoolPref(obj.key, value);
			if (obj.bind) {
				if (typeof obj.bind == "array")
					for (var i = 0; i < obj.bind.length; i++)
						guiconfig.usrpref.setBoolPref(obj.bind[i],
								value);
				if (typeof obj.bind == "string")
					guiconfig.usrpref.setBoolPref(obj.bind, value);
			}
			return true;
		},
		value : function(obj) {
			return (guiconfig.tryPref(obj) != null) ? document.getElementById(obj.key).checked : null;
		},
		reset : function(obj) {
			try {
				return guiconfig.usrpref.clearUserPref(obj.key);
			} catch (e) {
				return false;
			}
		}
	},
	integer : {
		write : function(obj) {
			var elements = {
				option: new Array,
				buttons: new Array
			}
			
			var value = guiconfig.tryPref(obj);
			var l = document.createElement("label");
			l.setAttribute("value", obj.name);
			l.setAttribute("control", obj.key);
			l.setAttribute("class", "optionLabel");
			elements.option.include(l);
			if (obj.select) {
				var c = guiconfig.buildSelect(obj, value);
			}
			else {
				var c = document.createElement("textbox");
				if (value != null)
					c.setAttribute("value", value);
				c.setAttribute("flex", "1");
			}
			if (value == null) {
				c.setAttribute("disabled", true);
				elements.buttons.include(guiconfig.addOptButton("edit", obj, [l, c]));
			}
			c.setAttribute("id", obj.key);
			c.addEventListener("command", function() {
				guiconfig.onOptChange(obj);
			}, false);
			
			elements.option.include(c);
			return elements;
		},
		get : function(obj) {
			try {
				return guiconfig.usrpref.getIntPref(obj.key);
			} catch (e) {
				return null;
			}
		},
		set : function(obj, value) {
			if (value == null)
				return false;
			guiconfig.pref.setIntPref(obj.key, value);
			if (obj.bind) {
				if (typeof obj.bind == "array")
					for (var i = 0; i < obj.bind.length; i++)
						guiconfig.usrpref.setIntPref(obj.bind[i],
								value);
				if (typeof obj.bind == "string")
					guiconfig.usrpref.setIntPref(obj.bind, value);
			}
			return true;
		},
		value : function(obj) {
			return (guiconfig.tryPref(obj) != null) ? document.getElementById(obj.key).value : null;
		},
		reset : function(obj) {
			try {
				return guiconfig.usrpref.clearUserPref(obj.key);
			} catch (e) {
				return false;
			}
		}
	},
	char : {
		write : function(obj) {
			var elements = {
				option: new Array,
				buttons: new Array
			}
			
			var value = guiconfig.tryPref(obj);
			var l = document.createElement("label");
			l.setAttribute("value", obj.name);
			l.setAttribute("control", obj.key);
			l.setAttribute("class", "optionLabel");
			elements.option.include(l);
			if (obj.select) {
				var c = guiconfig.toSelect(obj, value);
			}
			else if (obj.type == "color") {
				var s = document.createElement("spacer");
				s.setAttribute("flex", "1");
				
				var c = document.createElement("colorpicker");
				c.setAttribute("type", "button");
				if (value != null)
					c.setAttribute("color", value);
					//TODO add "custom color" button
					//var mwrt = guiconfig.addOptButton("edit", obj, [l, c]);
				elements.option.include(s);
			}
			else {
				var c = document.createElement("textbox");
				if (value != null)
					c.setAttribute("value", value);
				c.setAttribute("flex", "1");
			}
			if (value == null) {
				c.setAttribute("disabled", true);
				elements.buttons.include(guiconfig.addOptButton("edit", obj, [l, c]));
			}
			c.setAttribute("id", obj.key);
			c.addEventListener("change", function() {
				guiconfig.onOptChange(obj);
			}, false);
			elements.option.include(c);
			return elements;
		},
		get : function(obj) {
			try {
				return guiconfig.usrpref.getCharPref(obj.key);
			} catch (e) {
				return null;
			}
		},
		set : function(obj, value) {
			if (value == null) return false;
			guiconfig.pref.setCharPref(obj.key, value);
			if (obj.bind) {
				if (typeof obj.bind == "array")
					for (var i = 0; i < obj.bind.length; i++)
						guiconfig.usrpref.setCharPref(obj.bind[i], value);
				if (typeof obj.bind == "string")
					guiconfig.usrpref.setCharPref(obj.bind, value);
			}
			return true;
		},
		value : function(obj) {
			return (guiconfig.tryPref(obj) != null) ?
				((obj.type == "color") ?
					document.getElementById(obj.key).color :
					document.getElementById(obj.key).value) :
				null;
		},
		reset : function(obj) {
			try {
				return guiconfig.usrpref.clearUserPref(obj.key);
			} catch (e) {
				return false;
			}
		}
	}
}