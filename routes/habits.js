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
    const { id, habitId } = req.body;

    if(id && habitId) {
        let user = req.users.find(u => u.id === id);

        if(user) {
            let habit = user.habits.find(h => h.id === habitId);

            if(habit) {
                habit.check = true;
                habit.checks++;
                habit.streak++;
                if(habit.streak >= habit.maxStreak) {
                    habit.maxStreak = habit.streak;
                }
                
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

router.post("/uncheck", (req, res) => {
    const {id, habitId} = req.body;

    if(id && habitId) {
        let user = req.users.find(u => u.id === id);

        if(user) {
            let habit = user.habits.find(h => h.id === habitId);

            if(habit) {
                habit.check = false;
                habit.checks--;
                
                if(habit.streak >= habit.maxStreak) {
                    habit.maxStreak--;
                }

                habit.streak--;
                habit.dayChecked = false;

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
    const { id, habitId } = req.body;

    if(id && habitId) {
        let userIndex = req.users.findIndex(u => u.id === id);

        if (userIndex !== -1) {
            let habitIndex = req.users[userIndex].habits.findIndex(h => h.habitId === habitId);

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

router.get("/get", (req, res) => {
    const { id } = req.query;
    console.log(req.session.user);

    if(req.session.user) {
        if(id) {
            const habit = req.users.find(u => u.id == req.session.user.id).habits.find(h => h.id == id);

            if(habit) {
                res.status(200).json(habit);
            } else {
                res.status(400).json({ error: "No such habit" });
            }
        } else {
            res.status(400).json({ error: "No habit id provided!" });
        }
    } else {
        res.status(400).json({ error: "Lost connection" });
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