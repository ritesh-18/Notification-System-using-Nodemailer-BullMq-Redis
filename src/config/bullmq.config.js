//config for bullmq dashboard

const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const {notificationQueues} = require("../queues/mail.notification.queues");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(notificationQueues)],
  serverAdapter
});

module.exports = {serverAdapter};