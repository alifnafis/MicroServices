const amqp = require('amqplib')


async function consumeMessages() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertExchange('logExch', "direct");
  
  const q = await channel.assertQueue("infoQueue");
  
  await channel.bindQueue(q.queue, "logExch", "Info")

  channel.consume(q.queue, (msg) => {
    const data = JSON.parse(msg.content)
    console.log(data)
    channel.ack(msg);
  })
}

consumeMessages()