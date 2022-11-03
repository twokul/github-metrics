"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructSlackMessage = void 0;
/**
 * Creates the following structure for a message:
 *
 * -- header --
 * -- divider --
 * -- sections --
 * -- divider --
 * -- footer --
 */
function constructSlackMessage({ channel, header, footer, sections = [], text = '', }) {
    const blocks = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: header,
                emoji: true,
            },
        },
    ];
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
exports.constructSlackMessage = constructSlackMessage;
