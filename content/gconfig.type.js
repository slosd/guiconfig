guiconfig.__proto__ = {
	boolean: {
		write: function(opt) {
			opt.elements = {
				option: new Array,
				buttons: new Array
			}
			
			var option_element = document.createElement("checkbox");
			option_element.setAttribute("label", opt.name);
			option_element.setAttribute("id", opt.key);
			
			var value = guiconfig.getOption(opt);
			
			option_element.addEventListener("command", function() {
				guiconfig.onOptChange(opt);
			}, false);
			
			opt.elements.option.include(option_element);			
			
			if(value != null)
				option_element.setAttribute("checked", value);
			else
				opt.handle.disable(opt, true);
			
			return opt.elements;
		},
		disable: function(opt, button) {
			for(var i = 0; i < opt.elements.option.length; i++)
				opt.elements.option[i].setAttribute("disabled", true);
			if(button && !opt.button_edit)
				opt.elements.buttons.include(guiconfig.addOptButton("edit", opt, opt.elements));
		},
		get: function(opt) {
			try {
				return guiconfig.usrpref.getBoolPref(opt.key);
			}
			catch (e) {
				return null;
			}
		},
		set: function(opt, value) {
			if(value == null)
				return false;
			
			guiconfig.pref.setBoolPref(opt.key, value);
			guiconfig.setBindings(opt, "setBoolPref", value);
			
			return true;
		},
		exists: function(opt) {
			return opt.handle.get(opt) != null;
		},
		value: function(opt, value) {
			if(!$defined(value))
				return guiconfig.optionExists(opt) ? document.getElementById(opt.key).checked : null;
			else {
				document.getElementById(opt.key).checked = value;
				return true;
			}
		},
		reset: function(opt) {
			try {
				return guiconfig.usrpref.clearUserPref(opt.key);
			}
			catch (e) {
				return false;
			}
		}
	},
	integer: {
		write: function(opt) {
			opt.elements = {
				option: new Array,
				buttons: new Array
			}

			var label = document.createElement("label");
			label.setAttribute("value", opt.name);
			label.setAttribute("control", opt.key);
			label.setAttribute("class", "optionLabel");
			opt.elements.option.include(label);
			
			var value = guiconfig.getOption(opt);
			
			if(opt.type == "select") {
				var option_element = guiconfig.buildSelect(opt, value);

				option_element.addEventListener("change", function() {
					guiconfig.onOptChange(opt);
				}, false);
			}
			else {
				var option_element = document.createElement("textbox");
				option_element.setAttribute("flex", "1");

				if(value != null)
					option_element.setAttribute("value", value);

				guiconfig.addTextboxEvents(option_element, opt);
			}
			
			option_element.setAttribute("id", opt.key);
			
			opt.elements.option.include(option_element);

			if(value == null)
				opt.handle.disable(opt, true);

			return opt.elements;
		},
		disable: function(opt, button) {
			for(var i = 0; i < opt.elements.option.length; i++)
				opt.elements.option[i].setAttribute("disabled", true);
			if(button && !opt.button_edit)
				opt.elements.buttons.include(guiconfig.addOptButton("edit", opt, opt.elements));
		},
		get: function(opt) {
			try {
				return guiconfig.usrpref.getIntPref(opt.key);
			}
			catch (e) {
				return null;
			}
		},
		set: function(opt, value) {
			if(value == null)
				return false;
			
			guiconfig.pref.setIntPref(opt.key, value);
			guiconfig.setBindings(opt, "setIntPref", value);
			
			return true;
		},
		exists: function(opt) {
			return opt.handle.get(opt) != null;
		},
		value: function(opt, value) {
			if(!$defined(value))
				return guiconfig.optionExists(opt) ? document.getElementById(opt.key).value : null;
			else {
				document.getElementById(opt.key).value = value;
				return true;
			}
		},
		reset: function(opt) {
			try {
				return guiconfig.usrpref.clearUserPref(opt.key);
			}
			catch (e) {
				return false;
			}
		}
	},
	char: {
		write: function(opt) {
			opt.elements = {
				option: new Array,
				buttons: new Array
			}

			var label = document.createElement("label");
			label.setAttribute("value", opt.name);
			label.setAttribute("control", opt.key);
			label.setAttribute("class", "optionLabel");
			opt.elements.option.include(label);

			var value = guiconfig.getOption(opt);
			
			if(opt.type == "select") {
				var option_element = guiconfig.toSelect(opt, value);
			}
			else if(opt.type == "color") {
				var option_element = document.createElement("colorpicker");
				option_element.setAttribute("type", "button");

				if(value != null)
					option_element.setAttribute("color", value);
				
				opt.elements.buttons.include(guiconfig.addOptButton("color", opt, [label, option_element]));

				option_element.addEventListener("change", function() {
					guiconfig.onOptChange(opt);
				}, false);
			}
			/*
			 * TODO add file selection dialog
			 *
			else if(opt.type == "file") {
				
			}*/
			else {
				var option_element = document.createElement("textbox");
				option_element.setAttribute("flex", "1");

				if(value != null)
					option_element.setAttribute("value", value);

				guiconfig.addTextboxEvents(option_element, opt);
			}
			
			option_element.setAttribute("id", opt.key);
			
			opt.elements.option.include(option_element);
			
			if(value == null)
				opt.handle.disable(opt, true);
			
			return opt.elements;
		},
		disable: function(opt, button) {
			for(var i = 0; i < opt.elements.option.length; i++)
				opt.elements.option[i].setAttribute("disabled", true);
			if(button && !opt.button_edit)
				opt.elements.buttons.include(guiconfig.addOptButton("edit", opt, opt.elements));
		},
		get: function(opt) {
			try {
				return guiconfig.usrpref.getCharPref(opt.key);
			}
			catch (e) {
				return null;
			}
		},
		set: function(opt, value) {
			if(value == null)
				return false;

			guiconfig.pref.setCharPref(opt.key, value);
			guiconfig.setBindings(opt, "setCharPref", value);
			
			return true;
		},
		exists: function(opt) {
			return opt.handle.get(opt) != null;
		},
		value: function(opt, value) {
			var attribute = opt.type == "color" ? "color" : "value";
			if(!$defined(value))
				return guiconfig.optionExists(opt) ? document.getElementById(opt.key)[attribute] : null;
			else {
				document.getElementById(opt.key)[attribute] = value;
				return true;
			}
		},
		reset: function(opt) {
			try {
				return guiconfig.usrpref.clearUserPref(opt.key);
			}
			catch (e) {
				return false;
			}
		}
	}
};