const logger = {
    level: {
        WARN: "WARN",
        ERROR: "ERROR",
        OK: "OK"
    }, 
    log(level, str) {
        // YYYY-MM-DD HH:MM:SS
        const formatTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/,'');
        const msg = `[${formatTime}] ${level} |\t${str}`;
        if(level == this.level.ERROR) {
            console.error(msg);
        } else {
            console.log(msg);
        }
    },
    buildPayload(level, str) {
        return {
            level: level,
            info: str
        };
    }
};

module.exports = logger;