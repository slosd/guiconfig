var GCBoolElement = function(options) {
  GCElement.call(this, options);
}

gcCore.extendProto(GCBoolElement, GCElement);

GCBoolElement.prototype.build = function() {
  var element = new GCElement.Checkbox({
    "label": this.options.label
  });
  element.observer.add(function(topic) {
    switch(topic) {
      case "modified":
        this.observer.fire("modified");
        break;
    }
  }, this);
  this.elements.element = element;
  return element;
}

GCBoolElement.prototype.set = function(value) {
  if(is_defined(this.options.wrapper.scripts.setValue)) {
    this.options.wrapper.scripts.setValue.call(this, value);
  }
  else {
    var element = this.elements.element.getOptionElement();
    this.value = value;
    GCBoolElement.set(element, value);
  }
}

GCBoolElement.prototype.get = function() {
  if(is_defined(this.options.wrapper.scripts.getValue)) {
    return this.options.wrapper.scripts.getValue.call(this);
  }
  else {
    var element = this.elements.element.getOptionElement();
    return GCBoolElement.get(element);
  }
}

/* functions for setting/getting the values of checkboxes */

GCBoolElement.set = function(element, value) {
  value ? element.setAttribute("checked", "true") : element.removeAttribute("checked");
}

GCBoolElement.get = function(element) {
  return element.hasAttribute("checked");
}