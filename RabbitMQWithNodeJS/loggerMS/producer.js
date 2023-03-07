const amqp = require('amqplib')
const rabbitMQ = require('./config')


class Producer {
  channel;
  async createChannel() {
    const connection = await amqp.connect(rabbitMQ.url)
    this.channel = await connection.createChannel();
  }

  async publishMessage(routingKey, message) {
    if (!this.channel) {
      await this.createChannel()
    }
    const exchangeName = rabbitMQ.exchangeName
    await this.channel.assertExchange(exchangeName, "direct")

    const logDetails = {
      logType: routingKey,
      message: message,
      dateTime: new Date()
    }

    await this.channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(logDetails))
    );
    console.log(`The Message ${message} is sent to exchange ${exchangeName}`);
  }
}

module.exports = Producer;