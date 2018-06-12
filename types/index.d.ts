export interface SlackAppender {
        type: '@log4js-node/slack';
        // your Slack API token (see the slack docs)
        token: string;
        // the channel to send log messages
        channel_id: string;
        // the icon to use for the message
        icon_url?: string;
        // the username to display with the message
        username: string;
        // (defaults to basicLayout) - the layout to use for the message.
        layout?: Layout;
}

export type Appender = Appender | SlackAppender;
