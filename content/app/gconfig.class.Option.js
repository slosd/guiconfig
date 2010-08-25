var Option = function(key, options) {
  this.key = key;
  this.options = options;
  this.preference = new Preference(key, options.type);
  this.observer = new gcCore.GenericObserver();
}

Option.prototype.onDialogComplete = function() {
  var option;
  if(this.hasElement) {
	this.element.observer.add(this.onElementChange, this);  // track element from now on
  }
  this.preference.observer.add(this.onPrefChange, this);
  this.poll();
  for(var i = 0, l = this.options.wrapper.dependencies.length; i < l; i++) {
    var option = guiconfig.getPreferenceByKey(this.options.wrapper.dependencies[i].key);
    if(!is_defined(option)) {
      option = this.options.wrapper.dependencies[i];
    }
    else {
      this.options.wrapper.dependencies[i] = option;
    }
    option.observer.add(this.onDependencyChange, this);
    this.onDependencyChange(option.key);
  }
}

Option.prototype.onPrefChange = function(key) {
  this.poll();
}

Option.prototype.onElementChange = function(topic) {
  switch(topic) {
    case "created":
      this.setElement(this.value);
      break;
    case "enabled":
    case "disabled":
      this.observer.fire(this.key);
      break;
    case "locked":
      if(this.options.instantApply) {
        this.save();
      }
      break;
    case "unlocked":
    case "modified":
      this.set(this.element.get());
      if(this.options.instantApply) {
        this.save();
      }
      break;
  }
}

Option.prototype.onDependencyChange = function(key) {
  var option = guiconfig.getPreferenceByKey(key);
  if(is_defined(this.options.wrapper.scripts.dependencies)) {
    this.element.disabled = !this.options.wrapper.scripts.dependencies.call(this, option);
    this.element.removeButton("edit");
  }
  else {
    throw "dependencyScriptNeededFor(" + this.key + ")";
  }
}

Option.prototype.set = function(value) {
  this.value = value;
  this.setElement(value);
  this.setBindings(value);
  this.observer.fire(this.key);
}

Option.prototype.get = function() {
  if(typeof this.value == "undefined") {
    if(is_defined(this.options.wrapper.scripts.getPref)) {
      return this.options.wrapper.scripts.getPref.call(this);
    }
    else {
      return this.preference.get();
    }
  }
  else {
	return this.value;
  }
}

Option.prototype.reset = function() {
  if(is_defined(this.options.wrapper.scripts.resetPref)) {
    this.set(this.options.wrapper.scripts.resetPref.call(this));
  }
  else {
    this.set(this.preference.getDefault());
    if(this.options.instantApply) {
      this.save();
    }
  }
}

Option.prototype.save = function() {
  this.preference.options.observe = false;
  if(is_defined(this.options.wrapper.scripts.setPref)) {
    this.options.wrapper.scripts.setPref.call(this, this.value);
  }
  else {
    this.preference.set(this.value);
  }
  this.preference.options.observe = true;
  this.saveBindings();
}

Option.prototype.poll = function() {
  if(is_defined(this.options.wrapper.scripts.getPref)) {
    this.set(this.options.wrapper.scripts.getPref.call(this));
  }
  else {
    this.set(this.preference.get());
  }
}

Option.prototype.setElement = function(value) {
  if(this.hasElement) {
    if(!is_defined(value)) {
      this.element.locked = true;
      this.element.set(this.options.defaultValue);
    }
    else {
      this.element.set(value);
    }
  }
}

Option.prototype.setBindings = function(value) {
  for(var i = 0, l = this.options.wrapper.bindings.length; i < l; i++) {
    this.options.wrapper.bindings[i].set(value);
  }
}

Option.prototype.saveBindings = function() {
  for(var i = 0, l = this.options.wrapper.bindings.length; i < l; i++) {
    this.options.wrapper.bindings[i].save();
  }
}

Option.prototype.addElement = function(options) {
  this.element = new window["GC" + this.preference.type + "Element"](options);
  return this.element;
}

Option.prototype.__defineGetter__("hasElement", function() {
  return is_defined(this.element);
});