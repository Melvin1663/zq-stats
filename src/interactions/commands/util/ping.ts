import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../../types/types";

export default <Command>{
	name: 'ping',
	category: 'util',
	description: 'Bot latency',
	run: async (int: ChatInputCommandInteraction) => {
		let start = Date.now();
		await int.deferReply();

		let reply = await int.fetchReply();

		int.editReply(`🏓 Pong! Trip: \`${Math.abs(reply.createdTimestamp - int.createdTimestamp)}ms\` | API: \`${int.client.ws.ping}ms\``);
		return console.log(`Ping time: ${Date.now() - start}ms`);
	}
}
