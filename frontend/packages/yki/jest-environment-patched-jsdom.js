// test.environment.js

const JSDOMEnvironment = require("jest-environment-jsdom").default;

// These globals were removed from jsdom 16 but are required by dependency (forgot which one)
// See https://stackoverflow.com/a/68468204
module.exports = class CustomTestEnvironment extends JSDOMEnvironment {
    async setup() {
        await super.setup();
        this.global.TextEncoder = TextEncoder;
        this.global.TextDecoder = TextDecoder;
        this.global.Response = Response;
        this.global.Request = Request;
    }
};
