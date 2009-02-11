guiconfig.options = new Array;

//
// Accessibility
//
guiconfig.options[0] = {
	label: "accessibility",
	icon: "accessibility.png",
	content: [
		{
			label: "mouseclick",
			tab: true,
			content: [
				{
					label: "middleclick",
					content: [
						{
							handle: guiconfig.boolean,
							key: "middlemouse.contentLoadURL"
						}, 
						{
							handle: guiconfig.boolean,
							key: "middlemouse.paste"
						}
					]
				},
				{
					label: "urlbar",
					content: [
						{
							handle: guiconfig.boolean,
							key: "browser.urlbar.clickSelectsAll"
						},
						{
							handle: guiconfig.boolean,
							key: "browser.urlbar.doubleClickSelectsAll"
						}
					]
				}
			]
		},
		{
			label: "urlbar",
			tab: true,
			content: [
				{
					handle: guiconfig.boolean,
					key: "browser.urlbar.autoFill"
				}, 
				{
					handle: guiconfig.boolean,
					key: "browser.urlbar.matchOnlyTyped",
					indent: 1
				},
				{
					element: "space"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.fixup.alternate.enabled"
				},
				{
					handle: guiconfig.char,
					key: "browser.fixup.alternate.prefix"
				},
				{
					handle: guiconfig.char,
					key: "browser.fixup.alternate.suffix"
				}
			]
		},
		{
			label: "awesomebar",
			version: "(3\..*)",
			tab: true,
			content: [
				{
					handle: guiconfig.integer,
					key: "browser.urlbar.maxRichResults"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.urlbar.restrict.tag",
					version: "(3\.1\..*)",
					exists: function(opt) {
						return (guiconfig.char.get(opt) != null);
					},
					get: function(opt) {
						if(!guiconfig.optionExists(opt)) return null;
						return (guiconfig.char.get(opt) == "");
					},
					set: function(opt, value) {
						if(value == true)
							guiconfig.char.set(opt, "");
						else
							guiconfig.optionHandler(opt, "reset");
						opt.handle.value(opt, !!value);
					}
				},
				{
					handle: guiconfig.boolean,
					key: "browser.urlbar.restrict.history",
					version: "(3\.1\..*)",
					exists: function(opt) {
						return (guiconfig.char.get(opt) != null);
					},
					get: function(opt) {
						if(!guiconfig.optionExists(opt)) return null;
						return (guiconfig.char.get(opt) == "");
					},
					set: function(opt, value) {
						if(value == true)
							guiconfig.char.set(opt, "");
						else
							guiconfig.optionHandler(opt, "reset");
						opt.handle.value(opt, !!value);
					}
				},
				{
					handle: guiconfig.boolean,
					key: "browser.urlbar.restrict.bookmark",
					version: "(3\.1\..*)",
					exists: function(opt) {
						return (guiconfig.char.get(opt) != null);
					},
					get: function(opt) {
						if(!guiconfig.optionExists(opt)) return null;
						return (guiconfig.char.get(opt) == "");
					},
					set: function(opt, value) {
						if(value == true)
							guiconfig.char.set(opt, "");
						else
							guiconfig.optionHandler(opt, "reset");
						opt.handle.value(opt, !!value);
					}
				},
				{
					handle: guiconfig.boolean,
					key: "browser.urlbar.match.url",
					version: "(3\.1\..*)",
					exists: function(opt) {
						return (guiconfig.char.get(opt) != null);
					},
					get: function(opt) {
						if(!guiconfig.optionExists(opt)) return null;
						return (guiconfig.char.get(opt) == "");
					},
					set: function(opt, value) {
						if(value == true)
							guiconfig.char.set(opt, "");
						else
							guiconfig.optionHandler(opt, "reset");
						opt.handle.value(opt, !!value);
					}
				},
				{
					handle: guiconfig.boolean,
					key: "browser.urlbar.match.title",
					version: "(3\.1\..*)",
					exists: function(opt) {
						return (guiconfig.char.get(opt) != null);
					},
					get: function(opt) {
						if(!guiconfig.optionExists(opt)) return null;
						return (guiconfig.char.get(opt) == "");
					},
					set: function(opt, value) {
						if(value == true)
							guiconfig.char.set(opt, "");
						else
							guiconfig.optionHandler(opt, "reset");
						opt.handle.value(opt, !!value);
					}
				}
			]
		},
		{
			label: "misc",
			tab: true,
			content: [
				{
					label: "popup",
					content: [
						{
							handle: guiconfig.boolean,
							key: "browser.popups.showPopupBlocker"
						}
					]
				},
				{
					handle: guiconfig.integer,
					type: "select",
					key: "accessibility.tabfocus",
					allowed: [1, 2, 3, 4, 7]
				},
				{
					handle: guiconfig.integer,
					key: "browser.backspace_action",
					allowed: [0, 1, 2],
					select: true
				},
				{
					handle: guiconfig.boolean,
					key: "browser.search.openintab"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.preferences.instantApply",
					version: "(1\.5.*|(2|3)\..*)"
				},
				{
					handle: guiconfig.boolean,
					key: "accessibility.warn_on_browsewithcaret"
				},
				{
					handle: guiconfig.boolean,
					key: "accessibility.accesskeycausesactivation"
				}
			]
		}
	]
};

//
// Browser
//
guiconfig.options[1] = {
	label: "browser",
	icon: "browser.png",
	content: [
		{
			label: "alerts",
			tab: true,
			content: [
				{
					key: "update.showSlidingNotification",
					bind: "update_notifications.enabled",
					handle: guiconfig.boolean
				},
				{
					element: "space"
				},
				{
					handle: guiconfig.integer,
					key: "alerts.slideIncrement"
				},
				{
					handle: guiconfig.integer,
					key: "alerts.slideIncrementTime"
				},
				{
					handle: guiconfig.integer,
					key: "alerts.totalOpenTime"
				}
			]
		},
		{
			label: "cache",
			tab: true,
			content: [
				{
					handle: guiconfig.integer,
					type: "select",
					key: "browser.cache.check_doc_frequency",
					allowed: [0, 1, 2, 3]
				},
				{
					element: "space"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.cache.disk.enable"
				}, 
				{
					handle: guiconfig.integer,
					key: "browser.cache.disk.capacity",
					indent: 1
				},
				{
					handle: guiconfig.boolean,
					key: "browser.cache.disk_cache_ssl",
					indent: 1
				},
				{
					element: "space"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.cache.memory.enable"
				},
				{
					handle: guiconfig.integer,
					key: "browser.cache.memory.capacity",
					indent: 1
				}
			]
		}
	]
};

//
// Style
//
guiconfig.options[2] = {
	label: "style",
	icon: "style.png",
	content: [
		{
			label: "browser_style",
			tab: true,
			content: [
				{
					handle: guiconfig.boolean,
					key: "browser.chrome.favicons",
					bind: "browser.chrome.site_icons"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.chrome.toolbar_tips"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.urlbar.hideGoButton",
					version: "2\..*"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.preferences.animateFadeIn"
				},
				{
					handle: guiconfig.integer,
					type: "select",
					key: "browser.tabs.closeButtons",
					allowed: [0, 1, 2, 3],
					version: "((2|3)\..*)"
				}
			]
		},
		{
			label: "doc_style",
			tab: true,
			content: [
				{
					handle: guiconfig.boolean,
					key: "browser.display.show_image_placeholders"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.frames.enabled"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.blink_allowed"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.enable_automatic_image_resizing"
				}
			]
		},
		{
			label: "text_select",
			tab: true,
			content: [
				{
					key: "ui.textSelectBackground",
					handle: guiconfig.char,
					type: "color"
				},
				{
					key: "ui.textSelectForeground",
					handle: guiconfig.char,
					type: "color"
				},
				{
					key: "ui.textSelectBackgroundAttention",
					handle: guiconfig.char,
					type: "color"
				}
			]
		}
	]
};

//
// Downloads
//
guiconfig.options[3] = {
	label: "downloads",
	icon: "downloads.png",
	content: [
		{
			label: "downloadmanager",
			content: [
				{
					handle: guiconfig.boolean,
					key: "browser.download.manager.focusWhenStarting"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.download.manager.alertOnEXEOpen"
				},
				{
					handle: guiconfig.char,
					key: "browser.download.lastDir"
				}
			]
		},
		{
			label: "alerts",
			content: [
				{
					handle: guiconfig.boolean,
					key: "browser.download.manager.showAlertOnComplete"
				},
				{
					handle: guiconfig.integer,
					key: "browser.download.manager.showAlertInterval"
				}
			]
		}
	]
};

//
// Bookmarks
//
guiconfig.options[4] = {
	label: "bookmarks",
	icon: "bookmarks.png",
	content: [
		{
			label: "misc",
			tab: true,
			content: [
				{
					handle: guiconfig.boolean,
					key: "browser.tabs.loadBookmarksInBackground"
				},
				{
					handle: guiconfig.integer,
					key: "browser.bookmarks.livemark_refresh_seconds"
				},
				{
					handle: guiconfig.integer,
					key: "browser.bookmarks.max_backups",
					version: "(1\.8.*|(2|3)\..*)"
				}
			]
		},
		{
			label: "microsummaries",
			tab: true,
			version: "((2|3)\..*)",
			content: [
				{
					handle: guiconfig.boolean,
					key: "browser.microsummary.enabled"
				},
				{
					handle: guiconfig.integer,
					key: "browser.microsummary.updateInterval"
				},
				{
					handle: guiconfig.boolean,
					key: "browser.microsummary.updateGenerators"
				},
				{
					handle: guiconfig.integer,
					key: "browser.microsummary.generatorUpdateInterval"
				}
			]
		}
	]
};

//
// Developing
//
guiconfig.options[5] = {
	label: "developing",
	icon: "developing.png",
	content: [
		{
			label: "viewsource",
			content: [
				{
					key: "view_source.editor.external",
					handle: guiconfig.boolean
				},
				{
					key: "view_source.editor.path",
					handle: guiconfig.char,
					type: "file",
					indent: 1
				}
			]
		},
		{
			label: "misc",
			content: [
				{
					handle: guiconfig.boolean,
					key: "browser.dom.window.dump.enabled"
				},
				{
					handle: guiconfig.boolean,
					key: "javascript.options.strict"
				},
				{
					handle: guiconfig.boolean,
					key: "nglayout.debug.disable_xul_cache"
				}
			]
		}
	]
};