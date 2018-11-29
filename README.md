# Slack Appender for log4js-node

```bash
npm install @xanthous/log4js-to-slack
```

## Configuration

* `type` - `@xanthous/log4js-to-slack`
* `url` - `string` - your slack incomeWebhook url.
* `layout` - `object` (optional, defaults to `basicLayout`) - the layout to use for the message (see [layouts](layouts.md)).

## Example

```javascript
log4js.configure({
  appenders: {
    alerts: {
      type: '@xanthous/log4js-to-slack',
      url: 'https://xxxxxx.xxx/xxx',
    }
  },
  categories: {
    default: { appenders: ['alerts'], level: 'error' }
  }
});
```

