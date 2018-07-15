const chat = require("./chat");

module.exports = function(app) {
    app.use("/api/chat", chat);
};
