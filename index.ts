import { WebClient } from '@slack/web-api';
import { RTMClient } from '@slack/rtm-api';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

interface Channel {
    id: string,
    name: string,
}

const plugins = [
    require('./emoji-notifier'),
    require('./channel-notifier'),
];

(async () => {
    const token = process.env.SLACK_BOT_TOKEN;

    // Clients
    const rtmClient = new RTMClient(token);
    const webClient = new WebClient(token);
    const browser = await puppeteer.launch({headless: true});

    // Tools
    const channels = (await webClient.channels.list()).channels as Channel[];
    const channelIDDetector = name => {
        return channels.filter(channel => channel.name === name )[0].id;
    };
    const cacheName = `${__dirname}/cache.json`;

    await Promise.all(plugins.map(async plugin => {
        await plugin.default(
            {webClient, rtmClient, browser},
            {channelIDDetector, cacheName});
    }));
})();