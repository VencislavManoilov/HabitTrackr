const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;

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