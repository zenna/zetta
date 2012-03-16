/**
 * @author Zenna Tavares
 */

// Determines whether the browser is supports requirements
var isBrowserCapable = function(requirements) {
    if('localStorage' in requirements) {
        if( typeof localStorage === 'undefined') {
            return false;
        }
    }
    return true;
}

var probeServer = function(serverUrl) {
    var results = {
        'bandwidth' : null,
        'latency' : null
    };
    $.ajax({
        url : serverUrl + "/probe",
        context : document.body,
        success : function() {
            $(this).addClass("done");
        },

        failure : function() {

        },

    });
}

var generateGuid = function() {
    return parseInt(Math.random() * 1000000);
}

var collectServerClientStatistics = function(serverUrls) {

}

var selectServer = function(bandwidthTests) {
    throw a;
}

var parseUrl = function() {
    return jQuery.deparam.fragment();
}
