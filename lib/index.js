'use strict';

const slack = require('slack');

function slackAppender(config, layout) {
  return (loggingEvent) => {
    const data = {
      token: config.token,
      channel: config.channel_id,
      text: layout(loggingEvent, config.timezoneOffset),
      icon_url: config.icon_url,
      username: config.username
    };

    slack.chat.postMessage(data, (err) => {
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
