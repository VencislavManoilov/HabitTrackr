const express = require("express");
const router = express.Router();
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const emailVal = require("email-validator");
const { v4: uuidv4 } = require('uuid');

router.post("/signin", (req, res) => {
    const { name, email, password } = req.body;

    if(name && email && password) {

        const id = uuidv4();

        if(!emailVal.validate(email)) {
            return res.status(400).json({ error: "Not real email" });
        }

        if(req.users.find(u => u.email === email)) {
            return res.status(400).json({ error: "There is an account on this email" });
        }

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password must contain at least 8 characters, including at least one number, one uppercase letter and one lowercase letter." });
        }

        const newUser = { id: id, name: name, email: email, password: password };
        req.users.push(newUser);
        saveUsers(req.users);

        res.status(200).json({ success: true });
    }
})

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const user = req.users.find(u => u.email === email && u.password === password);

    if(user) {
        const session = uuidv4();

        req.session.user = user;
        req.theSessions.push({ id: user.id, session: session });

        fs.writeFileSync(path.join(__dirname, "../sessions.json"), JSON.stringify(req.theSessions), (err) => {
            if(err) {
                console.log(err);
            }
        });

        res.status(200).json({ success: true, session: session });
    } else {
        return res.status(400).json({ error: "Email or password is incorrect" });
    }
})

router.post("/session", (req, res) => {
    const { session } = req.body;

    const sessionObj = req.theSessions.find(s => s.session === session);
    
    if(sessionObj) {
        const userId = sessionObj.id;
        const user = req.users.find(u => u.id === userId);

        if(user) {
            req.session.user = user;
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ error: "User not found" });
        }
    } else {
        return res.status(400).json({ error: "Session not found" });
    }
})

function saveUsers(users) {
    fs.writeFileSync(path.join(__dirname, "../users.json"), JSON.stringify(users), (err) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ error: "Error saving data" });
        }
    })
}

module.exports = router;