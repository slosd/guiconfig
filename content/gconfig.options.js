//
// Accessibility
//
guiconfig.options[0] = [{
	label : "accessibility",
	icon : "accessibility.png"
}, [{
	label : "middleclick",
	tab : true
}, {
	handle : guiconfig.boolean,
	key : "middlemouse.contentLoadURL"
}, {
	handle : guiconfig.boolean,
	key : "middlemouse.paste"
}], [{
	label : "urlbar",
	tab : true
}, {
	handle : guiconfig.boolean,
	key : "browser.urlbar.autoFill"
}, {
	handle : guiconfig.boolean,
	key : "browser.urlbar.clickSelectsAll"
}, {
	handle : guiconfig.boolean,
	key : "browser.urlbar.doubleClickSelectsAll"
}, {
	handle : guiconfig.integer,
	key : "browser.urlbar.maxRichResults",
	version : "(3\..*)"
}], [{
	label : "misc",
	tab : true
}, {
	handle : guiconfig.integer,
	select : true,
	key : "accessibility.tabfocus",
	allowed : [1, 2, 3, 4, 7]
}, {
	handle : guiconfig.integer,
	key : "browser.backspace_action",
	allowed : [0, 1, 2],
	select : true
}, {
	handle : guiconfig.boolean,
	key : "browser.search.openintab"
}, {
	handle : guiconfig.boolean,
	key : "browser.preferences.instantApply",
	version : "(1\.5.*|(2|3)\..*)"
}, {
	handle : guiconfig.boolean,
	key : "accessibility.warn_on_browsewithcaret"
}, {
	handle : guiconfig.boolean,
	key : "accessibility.accesskeycausesactivation"
}]];
//
// Browser
//
guiconfig.options[1] = [{
	label : "browser",
	icon : "browser.png"
}, [{
	label : "popup",
	tab : true
}, {
	handle : guiconfig.boolean,
	key : "browser.popups.showPopupBlocker"
}], [{
	label : "alerts",
	tab : true
}, {
	handle : guiconfig.integer,
	key : "alerts.slideIncrement"
}, {
	handle : guiconfig.integer,
	key : "alerts.slideIncrementTime"
}, {
	handle : guiconfig.integer,
	key : "alerts.totalOpenTime"
}], [{
	label : "cache",
	tab : true
}, {
	handle : guiconfig.integer,
	select : true,
	key : "browser.cache.check_doc_frequency",
	allowed : [0, 1, 2, 3]
}, {
	handle : guiconfig.boolean,
	key : "browser.cache.disk.enable"
}, {
	handle : guiconfig.integer,
	key : "browser.cache.disk.capacity"
}, {
	handle : guiconfig.boolean,
	key : "browser.cache.memory.enable"
}, {
	handle : guiconfig.integer,
	key : "browser.cache.memory.capacity"
}, {
	handle : guiconfig.boolean,
	key : "browser.cache.disk_cache_ssl"
}]];
//
// Style
//
guiconfig.options[2] = [{
	label : "style",
	icon : "style.png"
}, [{
	label : "browser_style",
	tab : true
}, {
	handle : guiconfig.boolean,
	key : "browser.chrome.favicons",
	bind : "browser.chrome.site_icons"
}, {
	handle : guiconfig.boolean,
	key : "browser.chrome.toolbar_tips"
}, {
	handle : guiconfig.boolean,
	key : "browser.urlbar.hideGoButton",
	version : "2\..*"
}, {
	handle : guiconfig.boolean,
	key : "browser.preferences.animateFadeIn"
}, {
	handle : guiconfig.integer,
	select : true,
	key : "browser.tabs.closeButtons",
	allowed : [0, 1, 2, 3],
	version : "((2|3)\..*)"
}], [{
	label : "doc_style",
	tab : true
}, {
	handle : guiconfig.boolean,
	key : "browser.display.show_image_placeholders"
}, {
	handle : guiconfig.boolean,
	key : "browser.frames.enabled"
}, {
	handle : guiconfig.boolean,
	key : "browser.blink_allowed"
}, {
	handle : guiconfig.boolean,
	key : "browser.enable_automatic_image_resizing"
}], [{
	label : "text_select",
	tab : true
}, {
	handle : guiconfig.char,
	color : true,
	key : "ui.textSelectBackground"
}, {
	handle : guiconfig.char,
	color : true,
	key : "ui.textSelectForeground"
}, {
	handle : guiconfig.char,
	color : true,
	key : "ui.textSelectBackgroundAttention"
}]];
//
// Downloads
//
guiconfig.options[3] = [{
	label : "downloads",
	icon : "downloads.png"
}, [{
	label : "downloadmanager"
}, {
	handle : guiconfig.boolean,
	key : "browser.download.manager.focusWhenStarting"
}, {
	handle : guiconfig.char,
	key : "browser.download.lastDir"
}, {
	handle : guiconfig.boolean,
	key : "browser.download.manager.alertOnEXEOpen"
}], [{
	label : "alerts"
}, {
	handle : guiconfig.boolean,
	key : "browser.download.manager.showAlertOnComplete"
}, {
	handle : guiconfig.integer,
	key : "browser.download.manager.showAlertInterval"
}]];
//
// Bookmarks
//
guiconfig.options[4] = [{
	label : "bookmarks",
	icon : "bookmarks.png"
}, [{
	label : "microsummaries",
	version : "((2|3)\..*)"
}, {
	handle : guiconfig.boolean,
	key : "browser.microsummary.enabled"
}, {
	handle : guiconfig.integer,
	key : "browser.microsummary.generatorUpdateInterval"
}], [{
	label : "misc"
}, {
	handle : guiconfig.boolean,
	key : "browser.tabs.loadBookmarksInBackground"
}, {
	handle : guiconfig.integer,
	key : "browser.bookmarks.livemark_refresh_seconds"
}, {
	handle : guiconfig.integer,
	key : "browser.bookmarks.max_backups",
	version : "(1\.8.*|(2|3)\..*)"
}]];
//
// Developing
//
guiconfig.options[5] = [{
	label : "developing",
	icon : "developing.png"
}, [{
	label : "misc"
}, {
	handle : guiconfig.boolean,
	key : "browser.dom.window.dump.enabled"
}, {
	handle : guiconfig.boolean,
	key : "javascript.options.strict"
}, {
	handle : guiconfig.boolean,
	key : "nglayout.debug.disable_xul_cache"
}]];