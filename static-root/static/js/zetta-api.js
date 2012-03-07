$.subscribe("message", zetta.handleMessages);

var zetta = function() {
    var callbacks = [];
	function __recieveData(event) {
		if (event.data.action == 'recieve') {
			callback.apply();
		}
	}
	
	// Dispatch callbacks
	this.dispatch = function() {
	    this.callbacks[id]();
	    //DELETE callback
	}
	
	// Browser memory
	this.saveClient = function(key, value, callback) {
        var guid = generateGuid();
        var message = {action:'save', key:key, value:value, id:id};
        this.callbacks[id] = callback;
        postMessage(message);
    }

    // Fires an event with bucket attached, picked up by boss
    // Boss grabs data from local/regional/global storage
    // Fires an event back
    this.loadData = function(key, callback) {
        self.postMessage({'action':'load'});
		self.addEventListener('message',
	    // Message could come from anywhere
        return data;
    }
	// In regional memory a worker can read from any location
    
    
    this.handleMessages = function(message) {
        if (typeof message === "object") {
            if ('action' in message.data) {
                var action = message.data['action'];
                $.publish("zetta/" + action);
            }
            if ('save' in message.data) {
                if (successful) {
                    this.dispatch(id);
                }
            }
        }
        else {
            throw new Error("MSGError not object");
        }
    }
}