var Job = function(workerCode) {
    this.codeUrl = "";

    this.loadWorker = function() {
        this.worker = new Worker(this.codeUrl);
        this.worker.onmessage = this.handleMessages;
    };
    
    this.handleMessages = function(event) {
        console.log("message back");
        console.log(event);
    }

    this.pause = function() {
        worker.postMessage({
            action : 'zetta/pause'
        });
    };
    
    // Resume computation with no data in memory
    // But with data stored on disk in local storage
    this.resume = function() {
        
    }
    
    // Stop computation but allow job to finish cleanly
    this.cleanStop = function(killAfterDelay) {
        var timeUntilKillMs = 5E3;
        worker.postMessage('zetta/stop');
        if (killAfterDelay) {
            setTimeout(this.kill, timeUntilKllMs);
        }
    }


    this.kill = function() {
        this.woker.terimnate();
    }


    this.start = function() {
        this.worker.postMessage({
            changeState : 'start'
        });
    }
}