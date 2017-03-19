'use strict';

import {slack_webhook} from '../myconfig';

export function slack(channel, text) {
  console.log("DEBUG Calling slack")
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
