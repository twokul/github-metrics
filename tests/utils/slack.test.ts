import { constructSlackMessage } from '../../src/utils/slack';

describe('Format Utils', () => {
  test('constructs default message correctly', () => {
    const slackChannelId = 'fake-channel-id';
    const message = constructSlackMessage({
      channel: slackChannelId,
      header: 'Foobar',
    });

    expect(message.text).toEqual('');
    expect(message.channel).toEqual(slackChannelId);

    expect(message.blocks).toEqual([
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Foobar',
          emoji: true,
        },
      },
      { type: 'divider' },
    ]);
  });

  test('constructs slack message correctly without footer', () => {
    const slackChannelId = 'fake-channel-id';
    const sections = [
      {
        text: 'Hello',
      },
      {
        text: 'World',
      },
    ];
    const message = constructSlackMessage({
      channel: slackChannelId,
      header: 'Header',
      sections,
    });

    expect(message.text).toEqual('');
    expect(message.channel).toEqual(slackChannelId);

    expect(message.blocks).toEqual([
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Header',
          emoji: true,
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Hello',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'World',
        },
      },
    ]);
  });

  test('constructs slack message correctly with footer', () => {
    const slackChannelId = 'fake-channel-id';
    const sections = [
      {
        text: 'Hello',
      },
      {
        text: 'World',
      },
    ];
    const message = constructSlackMessage({
      channel: slackChannelId,
      header: 'Header',
      footer: 'Footer',
      sections,
    });

    expect(message.text).toEqual('');
    expect(message.channel).toEqual(slackChannelId);

    expect(message.blocks).toEqual([
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Header',
          emoji: true,
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Hello',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'World',
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Footer',
        },
      },
    ]);
  });
});
