'use strict';

const { IncomingWebhook } = require('@slack/client');

function slackAppender(config, layout) {
  return (loggingEvent) => {
    const text = layout(loggingEvent, config.timezoneOffset);
    const webhook = new IncomingWebhook(config.url);

    webhook.send(text, (err) => {
      if (err) {
        console.error('log4js:slack - Error sending log to slack: ', err); //eslint-disable-line
      }
    });
  };
}

function configure(config, layouts) {
  let layout = layouts.basicLayout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  return slackAppender(config, layout);
}

module.exports.configure = configure;
