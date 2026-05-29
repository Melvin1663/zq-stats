import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../../types/types";


const ratio = (a: number, b: number) => {
	if (b == 0) return a.toFixed(2);
	else return (a / b).toFixed(2);
};


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

		if (response.status === 404) {
			await int.editReply(`Player \`${username}\` not found.`);
			return;
		}

		if (!response.ok) {
			await int.editReply(`Error ${response.status}.`);
			return;
		}

		const data = await response.json();

		if (data.err) {
			await int.editReply(`Error ${data.err}.`);
			return;
		}

		const stats = data.result;

		await int.editReply([
			"**Lifetime**",
			`Kills: \`${stats.lifetime.kills}\``,
			`Deaths: \`${stats.lifetime.deaths}\``,
			`K/D: \`${ratio(stats.lifetime.kills, stats.lifetime.deaths)}\``,
			`Coins: \`${stats.lifetime.coins}\``,
			`Shards: \`${stats.lifetime.shards}\``,
			`BP: \`${stats.lifetime.bp}\``,
			"",
			"**Season**",
			`Kills: \`${stats.season_stats.kills}\``,
			`Deaths: \`${stats.season_stats.deaths}\``,
			`K/D: \`${ratio(stats.season_stats.kills, stats.season_stats.deaths)}\``
		].join("\n"));

	},
};
