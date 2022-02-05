# Url Shortener
**\*Dcard 2022 Backend Intern\***

API Documentation：https://wei032499.github.io/url_shortener/

## 概述(Overview)
1. Implement with `Node.js`, `MySQL`.
2. URL shortener has 2 APIs, please follow API example to implement:
    * A RESTful API to upload a URL with its expired date and response with a shorten URL.
    * An API to serve shorten URLs responded by upload API, and redirect to original URL. If URL is expired, please response with status 404.
3. Implement reasonable constrains and error handling of these 2 APIs.

## 使用套件
`express`：Web framework of Node.js。

`randomstring`：產生隨機字串，用以產生短網址ID。

`valid-url`：檢查URL格式是否正確，用在檢查 Upload URL API 的request body。

`jest`：Testing Framework。

`supertest`：testing HTTP server。


## Routes
```
./
├── openapi.yaml，REST API 描述文件
├── package.json
├── README.md
└── src
    ├── api
    │   └── v1.js，API functions
    ├── app.js
    ├── app.test.js，unit test file
    ├── checkerr.js，錯誤訊息轉換的function
    ├── database.js，存取資料庫的function
    └── index.js
```

## 資料欄說明(資料庫)
#### hash：
    id => VARCHAR(8)，短網址ID
    url => TEXT，原始URL
    expireAt => DATETIME，短網址到期時間
