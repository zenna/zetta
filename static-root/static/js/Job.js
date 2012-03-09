var Job = function(workerCode) {

    this.init = function() {
        var blobBuilder = new BlobBuilder();
        blobBuilder.append(workerCode);
        var blobUrl = window.URL.createObjectURL(bb.getBlob());
        this.worker = new Worker(blobUrl);
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
        worker.postMessage({
            action : 'zetta/start'
        });
    }
    
    this.init();
}