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

export default client;

["event", "interactions", "crash"].forEach(async (handler) => {
	let { default: x } = await import(`./src/handlers/${handler}`);
	x();
});

client.login(process.env.TOKEN);