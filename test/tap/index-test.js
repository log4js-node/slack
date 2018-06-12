'use strict';

const test = require('tap').test;
const sandbox = require('@log4js-node/sandboxed-module');
const appenderModule = require('../../lib');

function setupLogging(options, err) {
  const fakeSlack = {
    messages: [],
    chat: {
      postMessage: function (data, callback) {
        fakeSlack.messages.push(data);
        callback(err, { status: 'sent' });
      }
    }
  };

  const fakeLayouts = {
    layout: function (type, config) {
      this.type = type;
      this.config = config;
      return evt => evt.data[0];
    },
    basicLayout: evt => evt.data[0]
  };

  const fakeConsole = {
    errors: [],
    logs: [],
    error: function (msg, value) {
      this.errors.push({ msg: msg, value: value });
    },
    log: function (msg, value) {
      this.logs.push({ msg: msg, value: value });
    }
  };

  options.type = '@log4js-node/slack';
  const appender = sandbox.require('../../lib', {
    requires: {
      slack: fakeSlack
    },
    globals: {
      console: fakeConsole
    }
  }).configure(options, fakeLayouts);

  return {
    logger: msg => appender({ data: [msg] }),
    slack: fakeSlack,
    layouts: fakeLayouts,
    console: fakeConsole
  };
}

function checkMessages(assert, result) {
  result.slack.messages.forEach((msg, i) => {
    assert.equal(msg.channel, '#CHANNEL');
    assert.equal(msg.username, 'USERNAME');
    assert.match(msg.text, `Log event #${i + 1}`);
  });
}

test('log4js slackAppender', (batch) => {
  batch.test('module should export a configure function', (t) => {
    t.type(appenderModule.configure, 'function');
    t.end();
  });

  batch.test('slack setup', (t) => {
    const result = setupLogging({
      token: 'TOKEN',
      channel_id: '#CHANNEL',
      username: 'USERNAME',
      icon_url: 'ICON_URL'
    });

    result.logger('some log event');

    t.test('slack credentials should match', (assert) => {
      assert.equal(result.slack.messages[0].token, 'TOKEN');
      assert.equal(result.slack.messages[0].channel, '#CHANNEL');
      assert.equal(result.slack.messages[0].username, 'USERNAME');
      assert.equal(result.slack.messages[0].icon_url, 'ICON_URL');
      assert.end();
    });
    t.end();
  });

  batch.test('basic usage', (t) => {
    const setup = setupLogging({
      token: 'TOKEN',
      channel_id: '#CHANNEL',
      username: 'USERNAME',
      icon_url: 'ICON_URL',
    });

    setup.logger('Log event #1');

    t.equal(setup.slack.messages.length, 1, 'should be one message only');
    checkMessages(t, setup);
    t.end();
  });

  batch.test('config with layout', (t) => {
    const result = setupLogging({
      layout: {
        type: 'tester'
      }
    });
    t.equal(result.layouts.type, 'tester', 'should configure layout');
    t.end();
  });

  batch.test('separate notification for each event', (t) => {
    const setup = setupLogging({
      token: 'TOKEN',
      channel_id: '#CHANNEL',
      username: 'USERNAME',
      icon_url: 'ICON_URL',
    });
    setup.logger('Log event #1');
    setup.logger('Log event #2');
    setup.logger('Log event #3');

    t.equal(setup.slack.messages.length, 3, 'should be three messages');
    checkMessages(t, setup);
    t.end();
  });

  batch.test('should send errors to console', (t) => {
    const setup = setupLogging({}, new Error('aargh'));
    setup.logger('this will fail');
    t.equal(setup.slack.messages.length, 1, 'should be one message sent');
    t.equal(setup.console.errors.length, 1, 'should be one error on console');
    t.equal(setup.console.errors[0].msg, 'log4js:slack - Error sending log to slack: ');
    t.match(setup.console.errors[0].value, /aargh/);
    t.end();
  });

  batch.end();
});
