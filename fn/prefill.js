require('sugar')


Function.prototype.getParamNames = function () {
    var func = this;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

Object.prototype.pack = function() {
    var newKeys = arguments.callee.caller.getParamNames()
    var ret = {}
    var i=0;
    Object.values(this).forEach(function(value) {
        ret[newKeys[i]] = value
        i++
    })
    return ret
};

prefillManual = function prefillManual(origFunction, outerArguments, outerParameterNames, ctx) {
    var argumentsArray = []
    var innerParameterNames = origFunction.getParamNames()
    ctx = ctx || this;

    innerParameterNames.forEach(function(value) {
        var indexOfParameter = (outerParameterNames.indexOf(value));
        argumentsArray.push(outerArguments['' + indexOfParameter])
    })

    return origFunction.apply(ctx, argumentsArray)
}

Function.prototype.prefill = function(ctx) {
    var outerParams = arguments.callee.caller.getParamNames()
    var callerArguments = arguments.callee.caller.arguments

    return prefillManual.fill(this, callerArguments, outerParams, ctx)
}

Function.prototype.cprefill = function(ctx) {
    var outerParams = arguments.callee.caller.getParamNames()
    var callerArguments = arguments.callee.caller.arguments

    return prefillManual(this, callerArguments, outerParams, ctx)
}

Function.prototype.bindAndFill = function(source, runCtx) {
    runCtx = runCtx || this
    var parameterNames = this.getParamNames()
    var origFunction = this
    var argumentsArray = [];
    Object.keys(source).intersect(parameterNames).forEach(function(parameterName) {
        var positionOfParameter = parameterNames.indexOf(parameterName);
        argumentsArray[positionOfParameter] = source[parameterName]
    })
    return function() {
        return origFunction.apply(runCtx, argumentsArray)
    }
}