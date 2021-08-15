const express = require('express');
const app = express();
const routes = require('./routes/route');
const util = require('util')

// This file can be use for Authentication purposes.

app.use('/', routes);


module.exports = app;

