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

const logger = {
    level: {
        WARN: "WARN",
        ERROR: "ERROR",
        OK: "OK"
    }, 
    log(level, str) {
        // YYYY-MM-DD HH:MM:SS
        const formatTime = getNow();
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