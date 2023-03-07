const { json } = require('express');
const express = require('express');
const app = express();
const Producer = require('./producer')
const producer = new Producer()

app.use(express.json());

app.post("/sendLog", async(req,res, next) => {
    await producer.publishMessage(req.body.logType, req.body.message);
    res.send();
})

app.listen(3000, () => {
  console.log("server is started...")
})