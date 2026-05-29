import { Client } from "discord.js"
import { Dirent, readdirSync } from 'fs';
import client from '../../index';

export default () => {
    const load_dir = async (dirs: string) => {
        const event_files = readdirSync(`./build/src/events/${dirs}`).filter((file: string) => file.endsWith('.js'));
        for (const file of event_files) {
            const { default: event } = await import(`../events/${dirs}/${file}`);
            const event_name = file.split('.')[0];
            client.on(event_name, event.bind(null, client));
        }
    };

    readdirSync('./build/src/events/', { withFileTypes: true })
        .filter((x: Dirent) => x.isDirectory())
        .map((x: Dirent) => x.name)
        .forEach(async (e: string) => await load_dir(e));
}