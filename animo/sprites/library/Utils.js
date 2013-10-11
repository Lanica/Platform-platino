
ANSplitWithForm = function (content, strs) {
    do {
        if (!content) break;

        // string is empty
        if (content.length == 0) break;

        var posLeft = content.indexOf('{');
        var posRight = content.indexOf('}');

        // don't have '{' and '}'
        if (posLeft == -1 || posRight == -1) break;
        // '}' is before '{'
        if (posLeft > posRight) break;

        var pointStr = content.substr(posLeft + 1, posRight - posLeft - 1);
        // nothing between '{' and '}'
        if (pointStr.length == 0) break;

        var nPos1 = pointStr.indexOf('{');
        var nPos2 = pointStr.indexOf('}');
        // contain '{' or '}'
        if (nPos1 != -1 || nPos2 != -1) break;
        strs = pointStr.split(",");
        if (strs.length != 2 || strs[0] != null || strs[1] != null) {
            break;
        }
    } while (0);

    return strs;
};

ANPointFromString = function (content) {
    var ret = [0,0];
    try {
        if (content == "")
            return ret;

        var strs = ANSplitWithForm(content);
        var x = parseFloat(strs[0]);
        var y = parseFloat(strs[1]);
        ret = [x, y];
        
    } catch (e) {
    }
    return ret;
};

ANDeepCopy = function(obj) 
{
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
};

ANDegreesToRadians = function(angle){
	return angle* 0.01745329252;
};

ANRadiansToDegrees = function(angle){
	return angle * 57.29577951; 
};
