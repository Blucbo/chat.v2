const router = require("express").Router();
// const userService = require("../../services/user");

let countUsers = 0;
const users = [];
const messages = [];

let changesUserStatus = [];
let changesMesgStatus = [];

router.post("/", (req, res) => {
    const data = req.body;
    const user = {
        name: data.name,
        nickname: data.nickname,
        id: countUsers++
    };
    users.push(user);
    changesUserStatus = new Array(users.length).fill(true);
    changesMesgStatus.push(true);
    res.send(user)
});

router.post("/messages/", (req, res) => {
    const mesg = req.body;
    messages.push(mesg);
    changesMesgStatus = new Array(users.length).fill(true);
    res.status(200);
    res.send({status: 'send'});
});

router.get("/status/:id", (req, res) => {
    res.send({
        users: changesUserStatus[req.params.id],
        messages: changesMesgStatus[req.params.id]
    });
});

router.get("/users/:id", (req, res) => {
    changesUserStatus[req.params.id] = false;
    res.send(users);
});

router.get("/messages/:id", (req, res) => {
    changesMesgStatus[req.params.id] = false;
    res.send(messages);
});
router.get("/:id", (req, res) => {

});

module.exports = router;
