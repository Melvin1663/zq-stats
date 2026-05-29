import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../../types/types";


export default <Command>{
	name: "stats",
	category: "stats",
	description: "stats",
	options: [
		{
			name: "username",
			description: "username",
			type: 3,
			required: true,
		},
	],
	run: async (int: ChatInputCommandInteraction) => {
		const username = int.options.getString("username", true);

		await int.deferReply();

		const response = await fetch(`https://app.zeqa.net/api/player/stats/name/${encodeURIComponent(username)}`);

		const data = await response.json();

		await int.editReply(`${data.result.lifetime.kills}`)
	},
};
