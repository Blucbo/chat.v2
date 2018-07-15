const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const staticPath = path.normalize(__dirname + "/public");
app.use(express.static(staticPath));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const routes = require("./routes/api/routes")(app);

const server = app.listen(4200);