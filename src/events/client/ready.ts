import { Client } from 'discord.js';

export default async (client: Client) => {

	// @ts-ignore
	console.log(`Logged in as ${client.user.tag}`);

	if (!process.env.GUILD_ID) {
		console.log("GUILD_ID is not set, skipping guild command registration.");
		return;
	}

	const commands = Object.values(client.interactions.commands).map((command: any) => ({
		name: command.name,
		description: command.description,
		options: command.options ?? [],
		default_member_permissions: command.default_member_permissions,
	}));

	const guild = await client.guilds.fetch(process.env.GUILD_ID);
	await guild.commands.set(commands);
	console.log(`Registered ${commands.length} guild command(s).`);

	await client.application!.commands.set([]);
	// console.log(`Registered ${commands.length} global command(s).`);
}
