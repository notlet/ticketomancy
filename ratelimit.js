// thanks to https://www.npmjs.com/package/ratelimits for the original code, I optimized it and turned it into a class

class RateLimit {
    constructor(options) {
        this.time = (options.minutes * 60 * 1000 || 0) + (options.seconds * 1000 || 0) + (options.ms || 0) || 1000;
        this.threshold = options.threshold || 5;
        this.db = {};
    }

    check(k) {
        if (!this.db[k]) this.db[k] = { expire: (Date.now() + this.time), count: 1, clear: setTimeout(() => delete this.db[k], this.time) }; 
        else this.db[k].count++;
        return this.db[k].count <= this.threshold;
    };

    clear(k) {
        if (!this.db[k]) return true;
        clearTimeout(this.db[k].clear);
        delete this.db[k];
    }
}

module.exports = RateLimit;