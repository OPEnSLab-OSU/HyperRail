function getNow() {
    const date = new Date();

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDay().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const sec = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

function log(level, str) {
    // YYYY-MM-DD HH:MM:SS
    const formatTime = getNow();
    const msg = `[${formatTime}] ${level} |\t${str}`;
    if(level == logger.level.ERROR) {
        console.error(msg);
    } else {
        console.log(msg);
    }
}

const logger = {
    level: {
        WARN: "WARN",
        ERROR: "ERROR",
        OK: "OK"
    }, 
    ok(str) {
        log(this.level.OK, str);
    },
    warn(str) {
        log(this.level.WARN, str);
    },
    error(str) {
        log(this.level.ERROR, str);
    },
    buildPayload(lvl, str) {
        return {
            level: lvl,
            info: str
        };
    }
};

module.exports = logger;