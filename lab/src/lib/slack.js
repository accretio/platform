'use strict';

import { slack_webhook, slack_dev_channel, slack_channel, env, service_url } from '../config';

function slack(channel, text) {
  const opt = {
    method: 'post',
    headers: new Headers({
      'content-type': 'application/json'
    }),
    body: JSON.stringify({
      text: text,
      channel: channel
    })
  };
  fetch(slack_webhook, opt)
    .catch(function(err) {
      console.log("Failed to send slack message: %j", err);
    });
} 

export function notifyWorkshop(jobId) {
  const url = `${service_url}/admin/orders/search/_id:${jobId}`;
  const message = `@channel <${url}|Job ${jobId}> is waiting for production`;
  slack(slack_channel, message);
}
