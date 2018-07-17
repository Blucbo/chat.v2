const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const http = require('http').createServer(app);

const io = require("socket.io")(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/index.html')
});
app.get('/main-http.js', function (req, res) {
   res.sendFile(__dirname + '/main-http.js');
});

io.on('connection', function(client){
    console.log('client connected');
    client.on('event', function(data){});
    client.on('disconnect', function(){});
});

const routes = require("./routes/api/routes")(app);

const server = app.listen(4200);