var express = require("express");
var app = express();
const path = require("path");
const bodyParser = require("body-parser");
var http = require('http').createServer(app);

var io = require("socket.io")(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/index.html')
});
app.get('/main-socket.js', function (req, res) {
   res.sendFile(__dirname + '/main-socket.js');
});
app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/style.css');
});

let countUsers = 0;
const users = [];
const messages = [];

let changesUserStatus = [];
let changesMesgStatus = [];

io.on('connection', function(client) {
    console.log('client connected id:', client.id);
    client.on('create user', (id, newUser) => {
        const user = {
            name: newUser.name,
            nickname: newUser.nickname,
            id: id,
            status: 'online',
            label: 'just appeared'
        };
        console.log('user', user);
        users.push(user);
        client.emit('get user', user);
        client.emit('get messages', messages);
        io.emit('get users', users);
        const indexUser = users.length - 1;
        setTimeout(() => {
            if (users[indexUser].status === 'offline') return;
            users[indexUser].label = 'online';
            io.emit('get users', users);
        }, 60*1000);
    });
    client.on('new message', (mesg) => {
        if (messages.length >= 100) {
            messages.shift();
        }
        messages.push(mesg);
        io.emit('get message', mesg);
        // client.emit('get message', mesg);
    });

    client.on('typing', (user) => {
        client.broadcast.emit('typing', user);
    });

    client.on('stop typing', (user) => {
        client.broadcast.emit('stop typing', user);
    });
    client.on('disconnect', () => {
        const indexOfUserDisconnected = users.findIndex(u => u.id === client.id);
        const user = users[indexOfUserDisconnected];

        user.status = 'offline';
        user.label = 'just left';

        const msg = {
            msg: `goodbye everybody`,
            nickname: user.nickname
        };
        io.emit('get users', users);
        setTimeout(() => {
            users[indexOfUserDisconnected].label = 'offline';
            io.emit('get users', users);
        }, 60*1000);
        io.emit('get message', msg);
        console.log('disconnect', client.id);
    });
});

const routes = require("./routes/api/routes")(app);
http.listen(4200, function(){
    console.log('listening: 4200');
});
// const server = app.listen(4200);