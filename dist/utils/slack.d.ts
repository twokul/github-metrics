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
export declare function constructSlackMessage({ channel, header, footer, sections, text, }: {
    header: string;
    channel: string;
    sections?: Array<any>;
    text?: string;
    footer?: string;
}): ChatPostMessageArguments;
