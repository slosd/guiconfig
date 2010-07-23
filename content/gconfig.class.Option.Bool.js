var BoolOption = function(preference, options) {
	Option.call(this, preference, options);
}

BoolOption.prototype = new Option;
BoolOption.prototype.constructor = BoolOption;

BoolOption.prototype.setValue = function(value, useNative) {
	if(!is_defined(value))
		var value = this.getPref();
	if(this.Wrapper.scripts.setValue && !useNative) {
		this.Wrapper.scripts.setValue.call(this, value);
	}
	else {
		if(value)
			this.Elements.option.setAttribute("checked", "true");
		else
			this.Elements.option.removeAttribute("checked");
	}
	this.Elements.option.setUserData("value", value, null);
	this.onvaluechange();
	return value;
}

BoolOption.prototype.getValue = function(useNative) {
	if(this.Wrapper.scripts.getValue && !useNative) {
		return this.Wrapper.scripts.getValue.call(this);
	}
	else {
		return this.Elements.option.hasAttribute("checked");
	}
}

BoolOption.prototype.build = function() {
	if(Option.prototype.build.call(this)) {
		var element = new GCElement('checkbox', {
			'label': {
				'value': this.name
			},
			'onchange': function() {
				this.onvaluechange();
			}.bind(this)
		});
		
		this.Elements.option = element.element;
		this.Elements.prefBox.appendChild(element.dom);
	}
	return this.Elements.prefRow;
}