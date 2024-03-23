const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const fs = require("fs");
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

class Habit {
    constructor(text, howOften) {
        this.text = text;
        this.howOften = howOften;
        this.check = false;
        this.graph = [];
    }

    Check() {
        this.check = true;
    }
}

let users = [
    {id: "1", name: "Pesho", habits: []},
    {id: "2", name: "Gosho", habits: []},
    {id: "3", name: "Marto", habits: []},
];

app.use((req, res, next) => {
    req.Habit = Habit;
    req.users = users;
    next();
})

const habits = require("./routes/habits");
app.use("/habits", habits);

app.get("/", (req, res) => {
    res.redirect("/test");
})

app.get("/test", (req, res) => {
    res.status(200).send("Everything is OK!");
})

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(PORT, () => {
    console.log("Listening: " + PORT);
})