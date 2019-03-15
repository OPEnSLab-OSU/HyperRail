const os = require('os');
const ifaces = os.networkInterfaces();

module.exports.address = () => {
    let address;
    Object.keys(ifaces).forEach((ifname) => {
        ifaces[ifname].forEach((iface) => {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            address = iface.address;
        });
    });
    return address;
};

// module.exports.address();
