const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const fs = require("fs");
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

class Habit {
    constructor(text, when, goal) {
        this.text = text;
        this.when = when;
        this.check = false;
        this.streak = 0;
        this.goal = goal;
    }

    Check() {
        this.check = true;
        this.streak++;
    }
}

let users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

app.use((req, res, next) => {
    req.Habit = Habit;
    req.users = users;
    next();
})

const habits = require("./routes/habits");
app.use("/habits", habits);

app.get("/", (req, res) => {
    res.status(200).send(path.join(__dirname, "public", "index.html"));
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