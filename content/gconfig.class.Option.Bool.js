var BoolOption = function(preference, options) {
	Option.call(this, preference, options);
}

BoolOption.prototype = new Option;
BoolOption.prototype.constructor = BoolOption;

BoolOption.prototype.setValue = function(value) {
	if(!value)
		var value = this.getPref();
	if(this.Wrapper.setValue) {
		this.Wrapper.setValue.call(this, value);
	}
	else {
		this.Elements.option.setProperty("checked", !!value);
	}
	return value;
}

BoolOption.prototype.getValue = function() {
	if(this.Wrapper.getValue) {
		return this.Wrapper.getValue.call(this);
	}
	else {
		return !!this.Elements.option.checked;
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