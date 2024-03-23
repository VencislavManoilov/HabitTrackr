const express = require("express");
const app = express();
const router = express.Router();

router.post("/create", (req, res) => {
    const { id, text, howOften } = req.body;

    if(id && text && howOften) {
        let user = req.users.find(u => u.id === id);

        if(user) {
            user.habits.push(new req.Habit(text, parseInt(howOften)));
            res.status(200).json(user);
        } else {
            res.status(400).json({ error: "No such user" });
        }
    } else {
        res.status(400).json({ error: "Bad Request" });
    }

})

router.post("/check", (req, res) => {
    const { id, text, status } = req.body;

    if(id && text && status) {
        let user = req.users.find(u => u.id === id);

        if(user) {
            let habit = user.habits.find(h => h.text === text);

            if(habit) {
                habit.check = status;

                res.status(200).json(user);
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

module.exports = router;