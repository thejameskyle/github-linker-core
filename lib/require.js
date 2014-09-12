/*
 * github-linker-core
 * https://github.com/stefanbuck/github-linker
 *
 * Copyright (c) 2014 Stefan Buck
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');
var path = require('path');
var stripQuotes = require('./util.js').stripQuotes;

// List of nodejs core modules (v0.11.13)
// see: https://github.com/joyent/node/blob/master/lib/repl.js#L72
var coreModules = ['assert', 'buffer', 'child_process', 'cluster',
'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'net',
'os', 'path', 'punycode', 'querystring', 'readline', 'stream',
'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib', 'smalloc',
'tracing'];
var GITHUBCOM = 'https://github.com';
var NODEAPICOM = 'http://nodejs.org/api/%s.html';

var getRequireLink = function(npmRegistry, url, requireValue) {

    var link = '';

    if (coreModules.indexOf(requireValue) !== -1 ) {

        link = util.format(NODEAPICOM, requireValue);

    } else if (npmRegistry[requireValue]) {

        link = npmRegistry[requireValue];

    } else {
        var basePath = url.replace(GITHUBCOM, '');
        var requirePath = path.resolve(path.dirname(basePath), requireValue);
        if (path.extname(requirePath)) {
            link = requirePath;
        } else {
            link = 'resolve:' + requirePath;
        }
    }

    return link;
};

module.exports = function($, type, url, dictionary, cb) {

  var $requires, $coffeeRequires, $item, name, link;
  var result = [];

  // Search for require dom elements
  $requires = $('span.nx').filter(function() {
    return $(this).text() === 'require';
  }).next().next();

  if (type === 'coffee') {
    $coffeeRequires = $('span.nx').filter(function() {
        return $(this).text() === 'require';
    }).next();
    $requires = $.merge($coffeeRequires, $requires);
  }

  $requires.each(function(index, item) {
    $item = $(item);

    name = stripQuotes($item);
    link = getRequireLink(dictionary, url, name);

    result.push({
      el: $item,
      name: name,
      link: link
    });
  });
  cb(null, result);
};