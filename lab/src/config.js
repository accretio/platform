/*  In production sensitive data is read from the environment.
    Create a local config_dev.js file for development

    export default function(config) {
      config.stripe_sk = ...
      config.slack_webhook = ...
    }
*/

import setDevConfig from '../config_dev.js';

let config = {};

config.stripe_pk = process.env.STRIPE_PK || 'pk_test_KNYK2I1UsxoIXX0jDiG46mmj';
config.stripe_sk = process.env.STRIPE_SK; 
config.slack_webhook = process.env.SLACK_WEBHOOK;
config.slack_channel = process.env.SLACK_CHANNEL || '#dev';
config.env = process.env.NODE_ENV || 'production';
config.port = process.env.PORT || 3000;
config.url = process.env.URL;

setDevConfig(config);

export const stripe_pk = config.stripe_pk;
export const stripe_sk = config.stripe_sk;
export const slack_webhook = config.slack_webhook;
export const slack_dev_channel = config.slack_dev_channel;
export const env = config.env;
export const port = config.port;
