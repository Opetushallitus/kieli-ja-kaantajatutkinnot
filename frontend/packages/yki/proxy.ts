const express = require('express');

const setupProxy = require('./setupProxy');

const app = express();

setupProxy(app);

app.listen(8083);
