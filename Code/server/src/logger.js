const logger = {
    level: {
        WARN: "WARN",
        ERROR: "ERROR",
        OK: "OK"
    }, 
    log(level, str) {
        if(level == this.level.ERROR) {
            console.error(level + ": \t" + str);
        } else {
            console.log(level + ": \t" + str);
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