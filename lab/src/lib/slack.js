'use strict';

import { slack_webhook, slack_dev_channel, env } from '../config';

function slack(channel, text) {
  const opt = {
    method: 'post',
    headers: new Headers({
      'content-type': 'application/json'
    }),
    body: JSON.stringify({
      text: text,
      channel: (env === 'production')? channel : slack_dev_channel
    })
  };
  fetch(slack_webhook, opt)
    .catch(function(err) {
      console.log("Failed to send slack message: %j", err);
    });
} 

export function notifyWorkshop(jobId) {
  const url = `http://lab.accret.io/admin/orders/search/_id:${jobId}`;
  const message = `@channel <${url}|Job ${jobId}> is waiting for production`;
  slack('#workshop', message);
}
