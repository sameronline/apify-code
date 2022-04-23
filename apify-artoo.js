// ==UserScript==
// @name         Artoo JS injector user script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Injects Artoo, URI.js and moment.js into runtime
// @author       You
// @match        https://*
// @icon         https://medialab.github.io/artoo/public/img/artoo-icon.svg
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // @see https://www.jsdelivr.com/package/npm/artoo-js
    var artoojs = document.createElement('script');
    artoojs.type = 'text/javascript';
    artoojs.src = 'https://cdn.jsdelivr.net/npm/artoo-js@0.4.4/build/artoo.chrome.js';
    artoojs.id = 'artoo_injected_script';
    var artoojsSettings = {
        debug: true,
        jquery: {
            version: '3.6.0',
            force: true
        },
        dependencies: [
            {
                "name": "URI.js",
                "url": "//cdnjs.cloudflare.com/ajax/libs/URI.js/1.19.11/URI.min.js",
                "url-source": "https://cdnjs.com/libraries/URI.js",
                "globals": ["URI"]
            },
            {
                "name": "moment",
                "url": "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.3/moment.min.js",
                "url-source": 'https://cdnjs.com/libraries/moment.js',
                "globals": ["moment"]
            }
        ]
    };
    artoojs.settings = JSON.stringify(artoojsSettings);
    artoojs.onload = function() {
        // Override jQuery injection routine to use cdn.jsdelivr.net instead of artoo's jquery cdn as it goes down alot
        artoo.jquery.inject = function(cb) {
      // Properties
      var desiredVersion = artoo.settings.jquery.version,
          cdn = '//cdnjs.cloudflare.com/ajax/libs/jquery/' + desiredVersion + '/jquery.min.js';
      // Checking the existence of jQuery or of another library.
      var exists = (typeof jQuery !== 'undefined' && jQuery.fn) || artoo.$.fn,
          other = !exists && typeof $ !== 'undefined',
          currentVersion = exists && jQuery.fn.jquery ? jQuery.fn.jquery : '0';

      // jQuery is already in a correct mood
      if (exists &&
          currentVersion.charAt(0) === desiredVersion.charAt(0) &&
          currentVersion.charAt(2) === desiredVersion.charAt(2)) {
          artoo.log.verbose('jQuery already exists in this page ' +
                            '(v' + currentVersion + '). No need to load it again.');

          // Internal reference
          artoo.$ = jQuery;

          cb();
      }

      // Forcing jQuery injection, according to settings
      else if (artoo.settings.jquery.force) {
          artoo.injectScript(cdn, function() {
              artoo.log.warning('According to your settings, jQuery (v' +
                                desiredVersion + ') was injected into your page ' +
                                'to replace the current $ variable.');

              artoo.$ = jQuery;

              cb();
          });
      }

      // jQuery has not the correct version or another library uses $
      else if ((exists && currentVersion.charAt(0) !== '2') || other) {
          artoo.injectScript(cdn, function() {
              artoo.$ = jQuery.noConflict(true);

              // Then, if dollar does not exist, we set it
              if (typeof _root.$ === 'undefined') {
                  _root.$ = artoo.$;

                  artoo.log.warning(
                      'jQuery is available but does not have a correct version. ' +
                      'The correct version was therefore injected and $ was set since ' +
                      'it was not used.'
                  );
              }
              else {
                  artoo.log.warning(
                      'Either jQuery has not a valid version or another library ' +
                      'using $ is already present. ' +
                      'Correct version available through `artoo.$`.'
                  );
              }

              cb();
          });
      }

      // jQuery does not exist at all, we load it
      else {
          artoo.injectScript(cdn, function() {
              artoo.log.info('jQuery was correctly injected into your page ' +
                             '(v' + desiredVersion + ').');

              artoo.$ = jQuery;

              cb();
          });
      }
  };
        artoo.loadSettings(artoojsSettings);
        artoo.on('ready', function(e) {
           $('body').append("<div id='artoo-isready'></div>");
        });
    }
    document.head.appendChild(artoojs);
})();
