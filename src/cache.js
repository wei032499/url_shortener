const redis = require('redis');

class Cache {
    constructor() {
        this.client = redis.createClient();
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) reject(err);

                resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err) reject(err);

                resolve();
            });
        });
    }
}

module.exports = Database;