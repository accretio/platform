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
config.env = process.env.NODE_ENV || 'production';
config.port = process.env.PORT || 3000;
config.elasticsearch_endpoint = process.env.ELASTICSEARCH_ENDPOINT || 'localhost';
config.mixpanel_token = process.env.MIXPANEL_TOKEN || '01a6b70a0184a27fb083ff5973ac638e';

// AWS and S3 configuration
config.aws_credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}
config.s3_bucket_name = 'accretio-lab-files';

setDevConfig(config);

export const stripe_pk = config.stripe_pk;
export const stripe_sk = config.stripe_sk;
export const slack_webhook = config.slack_webhook;
export const env = config.env;
export const port = config.port;
export const service_url = config.service_url;
export const aws_credentials = config.aws_credentials;
export const s3_bucket_name = config.s3_bucket_name;
export const elasticsearch_endpoint = config.elasticsearch_endpoint;
export const mixpanel_token = config.mixpanel_token ;
export const bypass_https = config.bypass_https || false;
