const axios = require('axios');

const status = {
    CONNECTED: "Connected",
    DISCONNECTED: "Disconnected",
    RUNNING: "Running",
    IDLE: "Idle"
};

let availableBots = {};


exports.add = (bot, address) => {
    if(bot in availableBots) {
        return false;
    }

    availableBots[bot] = {
        connection: status.CONNECTED,
        status: status.IDLE,
        ipAddress: address 
    };
    return true;
};

exports.remove = (bot) => {
    delete availableBots[bot];
};

exports.updateStatus = () => {
    for(let key in availableBots) {
        axios.get(`http://${availableBots[key].ipAddress}/status`)
            .then((res) => {

            });
    }

};

exports.getStatus = () => {
    return availableBots;
};