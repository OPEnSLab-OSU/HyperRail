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

    // Don't attempt to format address if it doesn't exist
    if(!address) {
        return null;
    }
    
    // Convert to array of integer bytes
    address = address.split('.').map((a) => parseInt(a, 10));
    return address;
};

// module.exports.address();
