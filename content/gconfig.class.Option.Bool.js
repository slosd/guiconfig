/**
 * @description Class to handle preferences with BOOLEAN values
 * @param {} key
 */
var BoolOption = function(preference, options) {
	Option.call(this, preference, options);
}

BoolOption.prototype = new Option;
BoolOption.prototype.constructor = BoolOption;

/**
 * @description Set the value of an element representing a preference
 * @param {bool} v
 */
BoolOption.prototype.setValue = function(value) {
	if(!value)
		var value = this.getPref();
	this.Elements.option.setProperty("checked", !!value);
}

/**
 * @description Get the value of an element representing a preference
 */
BoolOption.prototype.getValue = function() {
	return !!this.Elements.option.checked;
}

/**
 * @description Build the elements for a boolean preference 
 */
BoolOption.prototype.build = function() {
	Option.prototype.build.call(this);
	this.Elements.option = document.createElement("checkbox");
	this.Elements.option.setAttribute("label", this.name);
	this.Elements.option.setAttribute("id", this.Preference.key);
	this.Elements.option.addEventListener("command", function(Preference) {
		return function() {
			Preference.onvaluechange();
		}
	}(this), false);
	this.Elements.prefBox.appendChild(this.Elements.option);
	return this.Elements.prefRow;
}