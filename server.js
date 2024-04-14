const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

class Habit {
    constructor(text, when, goal) {
        this.id = uuidv4();
        this.text = text;
        this.when = when;
        this.check = false;
        this.checks = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.goal = goal;
        this.graph = [];
    }
}

let users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
let sessions = JSON.parse(fs.readFileSync('sessions.json', 'utf8'));
const quotes = JSON.parse(fs.readFileSync('quotes.json', 'utf8')).quotes;

app.use((req, res, next) => {
    req.Habit = Habit;
    req.users = users;
    req.theSessions = sessions;
    next();
})

const habits = require("./routes/habits");
app.use("/habit", habits);

const auth = require("./routes/auth");
app.use("/auth", auth);

app.get("/", (req, res) => {
    res.status(200).send(path.join(__dirname, "public", "index.html"));
})

app.get("/home", (req, res) => {
    if(req.session.user) {
        res.status(200).sendFile(path.join(__dirname, "public", "home.html"));
    } else {
        res.redirect("/");
    }
})

app.get("/test", (req, res) => {
    resetHabits();
    res.status(200).send("Everything is OK!");
})

app.get("/user", (req, res) => {
    const user = req.session.user;

    if(user) {
        const userWithoutPassword = Object.assign({}, user);
        delete userWithoutPassword.password;

        res.status(200).json(userWithoutPassword);
    } else {
        res.redirect("/");
    }
})

app.get("/quote", (req, res) => {
    res.status(200).json(quotes[random(0, quotes.length)]);
})

app.get("/open", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "public", "habit.html"));
})

function resetHabits() {
    users.forEach(user => {
        user.habits.forEach(habit => {
            habit.graph.push({check: habit.check, day: new Date().toLocaleDateString()});
            
            if(habit.check) {
                habit.check = false;
            } else {
                habit.streak = 0;
            }
        });
    });

    fs.writeFileSync(path.join(__dirname, "users.json"), JSON.stringify(users), (err) => {
        if(err) {
            console.log(err);
        }
    })
}

function callFunctionAt0AM() {
    const now = new Date();

    // Calculate the time until 00:00 AM
    const oneAM = new Date(now);
    oneAM.setHours(0, 0, 0, 0); // Set to 00:00 AM
    let timeLeftToReset = oneAM - now;

    if (timeLeftToReset < 0) {
        timeLeftToReset += 24 * 60 * 60 * 1000; // Add 24 hours
    }

    setTimeout(function() {
        resetHabits();
    }, timeLeftToReset);
}

callFunctionAt0AM();

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(PORT, () => {
    console.log("Listening: " + PORT);
})

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}