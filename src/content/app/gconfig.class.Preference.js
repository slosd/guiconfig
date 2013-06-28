var Preference = function(key, type) {
  this.key = key;
  if(type && this.validateType(type)) {
    this.type = type;
  }
  else {
    this.type = this.getTypeFromConfig();
    if(this.type == null) {
      throw "typeNeedsToBeSetFor(" + key + ")";
    }
  }
  this.options = {
    "observe": true
  };
  this.observer = new gcCore.GenericObserver();
  this.observerID = this.getNewObserverID();
  PrefObserver.addObserver(this.key, this.onPrefChange, this, "pref"+this.observerID);
}

Preference.lastObserverID = 0;

Preference.types = {"32": "Char", "64": "Int", "128": "Bool"};

Preference.prototype.getNewObserverID = function() {
  return ++Preference.lastObserverID;
}

Preference.prototype.getTypeFromConfig = function() {
  var type = gcCore.MozPreferences.getPrefType(this.key);
  return Preference.types[type];
}

Preference.prototype.validateType = function(type) {
  return ["Char", "Int", "Bool"].indexOf(type) != -1;
}

Preference.prototype.onPrefChange = function(key) {
  if(this.options.observe) {
    this.observer.fire(key);
  }
}

Preference.prototype.set = function(value) {
  if(!is_defined(value)) {
    return this.reset();
  }
  else {
    return gcCore.MozPreferences["set" + this.type + "Pref"](this.key, value);
  }
}

Preference.prototype.get = function(defaultValue) {
  try {
    return gcCore.MozPreferences["get" + this.type + "Pref"](this.key);
  }
  catch(e) {
    return defaultValue;
  }
}

Preference.prototype.reset = function() {
  try {
    return gcCore.MozPreferences.clearUserPref(this.key);
  }
  catch(e) {
    return false;
  }
}

Preference.prototype.getDefault = function() {
  try {
    return gcCore.MozDefaultPreferences["get" + this.type + "Pref"](this.key);
  }
  catch(e) {
    return null;
  }
}

Preference.prototype.__defineGetter__("exists", function() {
  return this.get() != null;
});

Preference.prototype.__defineSetter__("observe", function(observe) {
  this.options.observe = !!observe;
});