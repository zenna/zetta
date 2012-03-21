(function() {
    if(!Date.now)
        Date.now = function() {
            return +new Date;
        };

    zetta = {
        version : "0.0.1",
    };
    zetta.recieveData = function(event) {
        if(event.data.action == 'recieve') {
            callback.apply();
        }
    }

    // Dispatch callbacks
    zetta.dispatch = function() {
        this.callbacks[id]();
        //DELETE callback
    }

    // Browser memory
    zetta.saveClient = function(key, value, callback) {
        var guid = generateGuid();
        var message = {
            action : 'save',
            key : key,
            value : value,
            id : id
        };
        this.callbacks[id] = callback;
        postMessage(message);
    }

    // Fires an event with bucket attached, picked up by boss
    // Boss grabs data from local/regional/global storage
    // Fires an event back
    zetta.loadData = function(key, callback) {
        self.postMessage({
            'action' : 'load'
        });
        // self.addEventListener('message',
        // Message could come from anywhere
        return data;
    }

    // In regional memory a worker can read from any location

    zetta.handleMessages = function(message) {
        if( typeof message === "object") {
            if('action' in message.data) {
                var action = message.data['action'];
                $.publish("zetta/" + action);
            }
            if('save' in message.data) {
                if(successful) {
                    this.dispatch(id);
                }
            }
        }
        else {
            throw new Error("MSGError not object");
        }
    }

    // Handle Messages
    self.onmessage = function(message) {
        if( typeof message.data === "object") {
            if('changeState' in message.data) {
                zetta.state = data.changeState;
                $.publish("zetta/" + action);
            }
            if('save' in message.data) {
                if(successful) {
                    this.dispatch(id);
                }
            }
        }
        else {
            throw new Error("MSGError not object");
        }
    };

})();
