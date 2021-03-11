import { ChatPostMessageArguments } from '@slack/web-api';

/**
 * Creates the following structure for a message:
 *
 * -- header --
 * -- divider --
 * -- sections --
 * -- divider --
 * -- footer --
 */
export function constructSlackMessage({
  channel,
  header,
  footer,
  sections = [],
  text = '',
}: {
  header: string;
  channel: string;
  sections?: Array<any>;
  text?: string;
  footer?: string;
}): ChatPostMessageArguments {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: header,
        emoji: true,
      },
    },
  ] as Array<any>;
  blocks.push({ type: 'divider' });

  sections.forEach((section) => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: section.text,
      },
    });
  });

  if (sections.length > 0 && footer) {
    blocks.push({ type: 'divider' });
  }

  if (footer) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: footer,
      },
    });
  }

  return {
    text,
    channel,
    blocks,
  };
}
