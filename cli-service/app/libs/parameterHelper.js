/**
 * Created by Alan on 5/20/2014.
 */
var HashMap = require('hashmap').HashMap;

/**
 * Converts an array of arguments to a map of parameter/value pairs
 * e.g. --arg1=value --arg2="value 2" -arg3 val3 -arg4 "value 4"
 * becomes:
 * arg1 => 'value'
 * arg2 => 'value 2'
 * arg3 => 'val3'
 * arg4 => 'value 4'
 *
 * @param arguments Array
 */
function parametersFromArguments(arguments) {
    var parameters = new HashMap();
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i].charAt(0) == '-' && arguments[i].charAt(1) != '-') {
            // [-arg val] structure
            var arg = arguments[i].substring(1);
            var val = arguments[i+1].replace(/^\"|\"$/g, '');
            parameters.set(arg, val);
            i++; // Skip the value that we already stored
        } else if (arguments[i].charAt(0) == '-' && arguments[i].charAt(1) == '-') {
            // [--arg=val] structure
            var split = arguments[i].split(/=(.+)?/);
            var arg = split[0].substring(2);
            var val = split[1].replace(/^\"|\"$/g, '');
            parameters.set(arg, val);
        }
    }
    return parameters;
}
exports.parametersFromArguments = parametersFromArguments;

/**
 * Validates that the supplied parameters match the defined criteria.
 *
 * @param params The supplied parameters
 * @param paramDef Defined criteria to match
 * @returns {boolean} True if the parameters match the defined criteria
 */
function argumentsValid(params, paramDef) {
    for (var param in paramDef) {
        if (paramDef[param].required && !typeof paramDef[param].default == 'undefined') {
            if (!params.has(param)) {
                return false;
            }
        }
        if (paramDef[param].dependency) {
            var tempParam = paramDef[param].dependency;
            if (paramDef[tempParam].required && typeof paramDef[tempParam].default == 'undefined') {
                if (!params.has(paramDef[param].dependency)) {
                    return false;
                }
            }
        }
        if (paramDef[param].dependencies) {
            for (var dependency in paramDef[param].dependencies) {
                var tempParam = paramDef[dependency];
                if (tempParam.required && typeof tempParam.default == 'undefined') {
                    if (!params.has(dependency)) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
exports.argumentsValid = argumentsValid;

/**
 * Converts the defined parameter criteria to user-friendly documentation for console output.
 *
 * @param paramDef
 * @returns {Array} List of strings to output (one for each line of text)
 */
function argumentDocumentation(paramDef) {
    var documentation = [];
    var headerString = '';
    for (var param in paramDef) {
        var string =    (typeof paramDef[param].default != 'undefined' ? '(' : (!paramDef[param].required ? '[' : '')) +
                            param +
                        (typeof paramDef[param].default != 'undefined' ? ')' : (!paramDef[param].required ? ']' : ''));

        headerString += ' ' + string;

        for (var c = string.length; c < 25; c++) {
            string += ' ';
        }
        string += paramDef[param].type;

        for (var c = string.length; c < 40; c++) {
            string += ' ';
        }
        string += paramDef[param].description;

        documentation.push(string);
    }
    documentation.unshift('');
    documentation.unshift(headerString.trim());
    documentation.push('');
    return documentation;
}
exports.argumentDocumentation = argumentDocumentation;