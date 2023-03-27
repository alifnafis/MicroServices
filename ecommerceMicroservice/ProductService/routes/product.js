const express = require('express');
const router = express.Router();
const Product = require("../model/Product")
const amqp = require("amqplib")

let order, channel, connection

async function connectToRabbitMQ() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue("product-service-queue", {durable: false});
}
connectToRabbitMQ()

router.post("/", async (req, res) => {
  const {name, price, description } = req.body;
  if(!name || !price || !description){
    return res.status(400).json({
      message: "Please Provide name, price, and Description"
    });
  }
  const product = new Product({ ...req.body });
  await product.save();
  return res.status(201).json({
    message: "Product Created Succesfully", product
  });
});

router.post("/buy", async (req,res) => {
  const { productIds } = req.body;
  const products = await Product.find({_id: {$in: productIds}});
  
  //SEND ORDER TO RABBITMQ ORDER QUEUE
  channel.sendToQueue("order-service-queue", Buffer.from(JSON.stringify({products})));

  //CONSUME PRVIOUSLY PLACED ORDER FROM RABBITMQ AND ACKNOWLEDGE THE TRANSACTION
  channel.consume("product-service-queue", (data) => {
    console.log("Consumed from product-service-queue");
    order = JSON.parse(data.content);
    channel.ack(data);
  });

  return res.status(201).json({
    message:"Order Placed SuccesFully",
    order
  })
})

module.exports = router