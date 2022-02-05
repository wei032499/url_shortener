const mysql = require('mysql');

class Database {
    constructor() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'url_shortener',
            password: 'vvUj!m4N]:2*~7ff',
            database: 'url_shortener'
        });
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);

                return resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err) return reject(err);

                return resolve();
            });
        });
    }
}

module.exports = Database;