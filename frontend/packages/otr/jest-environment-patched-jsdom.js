// test.environment.js

const JSDOMEnvironment = require("jest-environment-jsdom").default;

module.exports = class CustomTestEnvironment extends JSDOMEnvironment {
    async setup() {
        await super.setup();
        this.global.TextEncoder = TextEncoder;
        this.global.TextDecoder = TextDecoder;
        this.global.Response = Response;
        this.global.Request = Request;
    }
};
