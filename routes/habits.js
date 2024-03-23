const express = require("express");
const app = express();
const router = express.Router();

router.post("/create", (req, res) => {
    res.status(200).json(new req.Habit("Wash your ass", 13));
})

module.exports = router;