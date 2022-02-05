const app = require("./app");
const supertest = require("supertest");
const request = supertest(app);

const test_version = "v1";

// POST request
describe("/urls endpoint", () => {
    it("bad request", async () => {

        /**
         * Unsupported Media Type
         */
        var response = await request
            .post("/api/" + test_version + "/urls")
            .set('Content-type', 'text/plain')
            .send();

        expect(response.status).toBe(415);


        /**
         * Bad Request
         *      1. empty
         *      2. missing some fields
         *      3. expire time <= now
         */
        response = await request
            .post("/api/" + test_version + "/urls")
            .set('Content-type', 'application/json')
            .send({});

        expect(response.status).toBe(400);

        response = await request
            .post("/api/" + test_version + "/urls")
            .set('Content-type', 'application/json')
            .send({ "url": "http://localhost:3000/api/v1/test" });

        expect(response.status).toBe(400);


        response = await request
            .post("/api/" + test_version + "/urls")
            .set('Content-type', 'application/json')
            .send({ "url": "http://localhost:3000/api/v1/test", "expireAt": "1999-03-24T09:20:41Z" });

        expect(response.status).toBe(400);
        // expect(response.text).toBe("Hello world");
    })
});


// GET request
/*describe("/:url_id endpoint", () => {
    it("should return a response", async () => {
        const response = await request.get("/api/" + test_version + "/test")
        expect(response.status).toBe(200)
        expect(response.text).toBe("Hello world");
    })
});*/
