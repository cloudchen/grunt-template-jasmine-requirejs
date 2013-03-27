'use strict';

var lang = require('./lang');
var hasProp = lang.hasProp;

/**
 * Mixes additional source config into target config, and merges some
 * nested config, like paths, correctly.
 */
function mixConfig(target, source) {
    var prop, value;

    for (prop in source) {
        if (hasProp(source, prop)) {
            //If the value of the property is a plain object, then
            //allow a one-level-deep mixing of it.
            value = source[prop];
            if (typeof value === 'object' && value &&
                !lang.isArray(value) && !lang.isFunction(value) &&
                !lang.isRegExp(value)) {
                target[prop] = lang.mixin({}, target[prop], value, true);
            } else {
                target[prop] = value;
            }
        }
    }

    //Set up log level since it can affect if errors are thrown
    //or caught and passed to errbacks while doing config setup.
    if (lang.hasProp(target, 'logLevel')) {
        logger.logLevel(target.logLevel);
    }
}

module.exports = mixConfig;
