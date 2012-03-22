$('document').ready(function() {
    var params = parseUrl();
    var parentHostname;
    if('parentHostname' in params) {
        parentHostname = params['parentHostname'];
    }
    else {
        // Not embedded
        parentHostname = window.location.hostname;
    }
    var user = new User(parentHostname);
    
    user.script = "jobs/infon/infon-job.js"
    
    user.init();
});
