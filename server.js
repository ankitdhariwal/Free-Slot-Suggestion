const app = require('./app');
const http = require('http');
const PORT = 3000
const util = require('util')


// First this file will run

http.createServer(app).listen(PORT,()=>{
    util.log("Server has been started by Ankit Dhariwal on %d",PORT)
});
