const express = require("express");
const router = express.Router();

const Database = require('../database');
const checkerr = require('../checkerr');

const redis = require('redis');

const validUrl = require('valid-url');
const Hashids = require('hashids/cjs');
const hashids = new Hashids("&4;!F\#es4dtJ$W4");

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
    let url_id = null;
    const database = new Database();

    const cache = redis.createClient();
    // cache.on('error', (err) => console.log('Redis Client Error', err));


    database.query('INSERT INTO hash (url, expireAt) VALUES (?, STR_TO_DATE(?, "%Y-%m-%dT%H:%i:%sZ"))', [req.body.url, req.body.expireAt])
        .then((result) => url_id = hashids.encode(result.insertId))
        .then(() => cache.connect())
        .then(() => cache.select(0))
        .then(() => {
            return cache.set(url_id, req.body.url, {
                PX: new Date(req.body.expireAt) - new Date()
            });
        })
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
            cache.quit().catch((e) => { });
            database.close().catch((e) => { });
        });


});

router.get("/:url_id", (req, res) => {

    /**
     * 以短網址id查詢資料表(hash)，重新導向至原始連結
     */

    let database = null;

    const cache = redis.createClient();
    // cache.on('error', (err) => console.log('Redis Client Error', err));

    cache.connect()
        .then(() => cache.select(0))
        .then(() => { return cache.get(req.params.url_id); })
        .then((value) => {

            /**
             * cache中找不到對應的key，則從資料庫獲取資料
             */
            if (value == null) {
                database = new Database();
                return database.query('SELECT * FROM hash WHERE id = ? AND expireAt > UTC_TIMESTAMP()', [hashids.decode(req.params.url_id)]);

            }

            /**
             * 已從cache中獲取資料。 url_id => url
             */
            // console.log("cached!", value);
            const data = { url: value };
            return [data];
        })
        .then((rows) => {
            if (rows.length === 0) throw { status: 404, message: "連結不存在或已過期" };

            res.redirect(301, rows[0].url);

            /**
             * 資料從資料庫撈出，意即不在cache則寫入cache
             */
            if (!isNaN(new Date(rows[0].expireAt))) {
                const url_id = hashids.encode(rows[0].id);
                cache.set(url_id, rows[0].url, {
                    PX: new Date(rows[0].expireAt) - new Date()
                });
            }

        })
        .catch((err) => {
            console.log(err);
            const errMSg = checkerr(err);
            res.status(errMSg.status).send({ message: errMSg.message });
        })
        .finally(() => {
            cache.quit().catch((e) => { });
            if (database !== null)
                database.close().catch((e) => { });
        });

});

module.exports = router;