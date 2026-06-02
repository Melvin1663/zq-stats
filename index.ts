import { Client, Partials } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
    intents: /*[
        Discord.GatewayIntentBits.Guilds, 
        Discord.GatewayIntentBits.GuildMessages, 
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.MessageContent,
    ]*/ 3276799,
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.canvas = {
    imgs: {},
    fonts: {}
}
client.interactionsCache = {};
client.interactions = {
    commands: {},
    context: {
        user: {},
        message: {},
    },
};

export default client;

const main = async () => {
	for (const handler of ["interactions", "event"]) {
		const { default: x } = await import(`./src/handlers/${handler}.js`);
		await x();
	}

	await client.login(process.env.TOKEN);
};

main();
