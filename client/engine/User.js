/**
 * @author Zenna Tavares
 */

var User = function(parentHostname) {
    var MS_PER_TIMESTAMP = 500;
    // To ensure we don't wrongly think we are still running
    var MS_STARTUP_DELAY = 1000;

    var max_concurrent_jobs = 1;

    // Event Handling
    $.subscribe("storage", this.handleStorage);

    this.handleStorage = function() {
        alert("The storage has been updated");

    };

    // Filter out closed/dead windows
    this.cleanupTestWindowData = function(windowData, maxElapsedMs) {
        var cleanWindowData = {};
        var timeNow = (new Date()).getTime();
        var anyWindowsWorking = false;
        for(var windowId in windowData) {
            if(timeNow - windowData[windowId]['time'] < maxElapsedMs) {
                cleanWindowData[windowId] = windowData[windowId];
                var isWorking = cleanWindowData[windowId]['state'] === 'working' ? true : false;
                anyWindowsWorking = anyWindowsWorking || isWorking;
            }
            else {
                console.log("time difference: ", timeNow - windowData[windowId]['time'] - maxElapsedMs);
            }

        }
        return {
            anyWindowsWorking : anyWindowsWorking,
            cleanWindowData : cleanWindowData
        };
    }

    // Update data stored in local storage for cross window comms
    this.updateWindowData = function(self, recurse) {
        var betweenUpdatesMs = 1000;
        var maxPerturbMs = 1000;
        var windowId = self.currentWindowStatus.windowId;
        (function() {
            var windowDataString = localStorage.getItem('windowData');
            var windowData = windowDataString === null ? {} : JSON.parse(windowDataString);
            self.currentWindowStatus.time = (new Date()).getTime();
            var cleanupTestHash = self.cleanupTestWindowData(windowData, betweenUpdatesMs + maxPerturbMs + 100);
            var anyWindowsWorking = cleanupTestHash.anyWindowsWorking || self.currentWindowStatus.state === 'working' ? true : false;
            var cleanWindowData = cleanupTestHash.cleanWindowData;
            cleanWindowData[windowId] = self.currentWindowStatus;

            try {
                localStorage.setItem("windowData", JSON.stringify(cleanWindowData));
                if(!anyWindowsWorking) {
                    // TODO: WARNING, what if updateWindow called before
                    // negotiateWindoW FInished
                    self.negotiateWindow(windowData);
                }
            } catch(err) {
                console.log("error");
            }
            var randomPerturbMs = parseInt(Math.random() * maxPerturbMs) - maxPerturbMs;
            if(recurse) {
                setTimeout(self.updateWindowData, betweenUpdatesMs + randomPerturbMs, self, true);
            }
        })();
    };

    // Decide if this window will be executing jobs
    this.negotiateWindow = function() {
        // TODO: WOrk out some way
        var iAmTheChosenOne = true;
        if(iAmTheChosenOne) {
            this.currentWindowStatus.state = "working";
            this.updateWindowData(this, false);
            // Find out if I should resume or not
            // Need to speak with
            if (this.script) {
                this.handleJob({action:'start',codeUrl:this.script})
            }
            else {
                this.shouldResume();
            }
            // this.currentWindowStatus.state = "idle";
            // this.updateWindowData(this, false);
        }
    }


    this.clear = function() {
        console.log();
        this.currentWindowStatus.state = 'idle';
    }

    // Find bandwidth and latency values to a localServer
    var probeServer = function(serverUrl, success, failure, numTests) {
        var results = {};
        results.latency = [];
        results.bandwidth = [];
        var then;
        var now;
        $.ajax({
            url : serverUrl + "/probe",

            beforeSend : function() {
                then = (new Date).getTime();
            },

            success : function() {
                now = (new Date).getTime();
                results.latency.push(now - then);
            },

            complete : function() {
                if(trialNum === 0) {
                    Callback(results);
                }
                else {
                    probeServerInner(serverUrl, successCallback, failureCallback, numTests - 1);
                }
            }

        });
    };


    this.probeSerers = function(localServers) {
        console.log("Starting probe");
        var serverStats = {};
        for(var i = 0; i < localServers.length; ++i) {
            serverStats[localServers[i]] = probeServer(localServers[i]);
        }
    }


    this.shouldResume = function() {
        var self = this;

        var request = $.ajax({
            url : "http://127.0.0.1:8000/get_orders",
            type : "POST",
            dataType : "json",
            crossDomain : true,
            beforeSend : function(xhr) {
                xhr.setRequestHeader('X-Custom-Header', 'value');
            },

            complete : function(a, b) {
                var alpha;
            }

        });

        request.success(function(data, textStatus, jqXHR) {
            self.handleJob(data)
        })

    }

    this.handleJob = function(data) {
        // TODO: Validate data
        self.job = new Job();
        if(data.action === 'resume') {
            self.job.code = data.codeUrl;
            self.job.resume();
        }
        else if(data.action === 'probe') {
            this.removeItem("workspace");
            this.probeServers(data.localServers);
        }
        else if(data.action === 'start') {
            self.job.codeUrl = data.codeUrl;
            // this.removeItem("workspace");
            self.job.loadWorker();
            self.job.start();
        }
        else {
            throw new Error("Action not recognised");
        }
    }


    this.init = function() {
        var requirements = {
            localStorage : true
        };
        if(isBrowserCapable(requirements)) {
            var windowId = (new Date).getTime() + "-" + generateGuid();
            this.currentWindowStatus = {
                parentHostname : parentHostname,
                time : (new Date()).getTime(),
                state : 'idle',
                windowId : windowId
            };
            this.updateWindowData(this, true);
        }
    };

}