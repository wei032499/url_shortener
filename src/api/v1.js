const express = require("express");
const router = express.Router();

const Database = require('../database');
const checkerr = require('../checkerr');

const validUrl = require('valid-url');
const randomstring = require("randomstring");

router.post('/urls', function (req, res) {

    if (!req.is('application/json')) {
        res.status(415).send("Unsupported Media Type");
        return;
    }

    /**
     * 確認post請求是否正確:
     *      1. url應為 http(s)://....
     *      2. expire的時間應大於現在的時間
     */
    if (!validUrl.isUri(req.body.url) || isNaN(new Date(req.body.expireAt)) || new Date(req.body.expireAt) <= new Date()) {
        res.status(400).send({ message: "Bad Request" });
        return;
    }

    /**
     * 隨機生成短網址id，並寫入資料庫
     * 
     * Database Table:
     *      table name => hash
     *      
     *      id => VARCHAR(8)
     *      url => TEXT
     *      expireAt => DATETIME
     *      
     */
    const url_id = randomstring.generate(8);
    const database = new Database();
    database.query('INSERT INTO hash (id, url, expireAt) VALUES (?, ?, STR_TO_DATE(?, "%Y-%m-%dT%H:%i:%sZ"))', [url_id, req.body.url, req.body.expireAt])
        .then(() => {
            const splits = req.originalUrl.split('/');
            splits.pop();
            const path = req.protocol + "://" + req.headers.host + splits.join('/') + "/";
            res.status(200).send({
                id: url_id,
                shortUrl: path + url_id
            });

        })
        .catch((err) => {
            console.log(err);
            const errMSg = checkerr(err);
            res.status(errMSg.status).send({ message: errMSg.message });
        })
        .finally(() => {
            database.close();
        });


});

router.get("/:url_id", (req, res) => {

    if (!req.is('application/json')) {
        res.status(415).send("Unsupported Media Type");
        return;
    }

    /**
     * 以短網址id查詢資料表(hash)，重新導向至原始連結
     */

    const database = new Database();
    database.query('SELECT * FROM hash WHERE id = ? AND expireAt > UTC_TIMESTAMP()', [req.params.url_id])
        .then((rows) => {
            if (rows.length === 0) throw { status: 404, message: "連結不存在或已過期" };

            res.redirect(rows[0].url);

        })
        .catch((err) => {
            console.log(err);
            const errMSg = checkerr(err);
            res.status(errMSg.status).send({ message: errMSg.message });
        })
        .finally(() => {
            database.close().catch((e) => { });
        });


});

module.exports = router;