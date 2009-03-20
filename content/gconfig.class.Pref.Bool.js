/**
 * @description Class to handle preferences with BOOLEAN values
 * @param {} key
 */
var BoolPreference = function(key, type, options) {
	this._parent_ = new Preference;
	Preference.call(this, key, type, options);
}

BoolPreference.prototype = new Preference;

/**
 * @description Set the value of an element representing a preference
 * @param {bool} v
 */
BoolPreference.prototype.setValue = function(value) {
	if(!$defined(value))
		var value = this.getPref();
	this.Elements.option.setAttribute("checked", !!value);
}

/**
 * @description Get the value of an element representing a preference
 */
BoolPreference.prototype.getValue = function() {
	return !!this.Elements.option.checked;
}

/**
 * @description Build the elements for a boolean preference 
 */
BoolPreference.prototype.build = function() {
	this._parent_.build.call(this);
	this.Elements.option = document.createElement("checkbox");
	this.Elements.option.setAttribute("label", this.name);
	this.Elements.option.setAttribute("id", this.key);
	this.Elements.option.addEventListener("command", function(Preference) {
		return function() {
			Preference.onvaluechange();
		}
	}(this), false);
	this.Elements.prefBox.appendChild(this.Elements.option);
	return this.Elements.prefRow;
}