const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/create", (req, res) => {
    const { id, text, when, goal } = req.body;

    if(id && text && when && goal) {
        if(!goal) {
            res.status(400).json({ error: "No goal set" });
            return;
        }

        let user = req.users.find(u => u.id === id);

        if(user) {
            user.habits.push(new req.Habit(text, parseInt(when), goal));

            saveUsers(req.users);

            res.status(200).json(user.habits);
        } else {
            res.status(400).json({ error: "No such user" });
        }
    } else {
        res.status(400).json({ error: "Bad Request" });
    }

})

router.post("/check", (req, res) => {
    const { id, text } = req.body;

    if(id && text) {
        let user = req.users.find(u => u.id === id);

        if(user) {
            let habit = user.habits.find(h => h.text === text);

            if(habit) {
                habit.check = true;
                habit.streak++;

                saveUsers(req.users);

                res.status(200).json(user.habits);
            } else {
                res.status(400).json({ error: "No such habit" });
            }
        } else {
            res.status(400).json({ error: "No such user" });
        }
    } else {
        res.status(400).json({ error: "Bad Request" });
    }
})

router.delete("/delete", (req, res) => {
    const { id, text } = req.body;

    if(id && text) {
        let userIndex = req.users.findIndex(u => u.id === id);

        if (userIndex !== -1) {
            let habitIndex = req.users[userIndex].habits.findIndex(h => h.text === text);

            if (habitIndex !== -1) {
                req.users[userIndex].habits.splice(habitIndex, 1);

                saveUsers(req.users);

                res.status(200).json(req.users[userIndex].habits);
            } else {
                res.status(400).json({ error: "No such habit for the user" });
            }
        } else {
            res.status(400).json({ error: "No such user" });
        }
    } else {
        res.status(400).json({ error: "Bad Request" });
    }
})

function saveUsers(users) {
    fs.writeFileSync(path.join(__dirname, "../users.json"), JSON.stringify(users), (err) => {
        if(err) {
            console.log("Error: ", err);
            return res.status(400).json({ error: "Something went wrong" });
        }
    });
}

module.exports = router;