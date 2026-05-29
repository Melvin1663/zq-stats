import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../../types/types";
import { ApiResponse, PlayerStats } from "../../../types/zeqaTypes";

const ratio = (a: number | undefined, b: number | undefined) => {
	if (b === 0 || b === undefined) return (a ?? 0).toFixed(2);
	return ((a ?? 0) / (b ?? 1)).toFixed(2);
};

export default <Command>{
	name: "stats",
	category: "stats",
	description: "Shows a player's major Zeqa stats",
	options: [
		{
			name: "username",
			description: "The player's username",
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
			await int.editReply(`Zeqa API returned error ${response.status}.`);
			return;
		}

		const data = await response.json() as ApiResponse<PlayerStats>;

		if (data.err) {
			await int.editReply(`Zeqa API error: ${data.err}.`);
			return;
		}

		const stats = data.result;

		await int.editReply([
			`**Zeqa Stats: ${username}**`,
			"",
			"**Lifetime**",
			`Kills: \`${stats?.lifetime.kills}\``,
			`Deaths: \`${stats?.lifetime.deaths}\``,
			`K/D: \`${ratio(stats?.lifetime.kills, stats?.lifetime.deaths )}\``,
			`Coins: \`${stats?.lifetime.coins}\``,
			`Shards: \`${stats?.lifetime.shards}\``,
			`BP: \`${stats?.lifetime.bp}\``,
			"",
			"**Season**",
			`Kills: \`${stats?.season_stats.kills}\``,
			`Deaths: \`${stats?.season_stats.deaths}\``,
			`K/D: \`${ratio(stats?.season_stats.kills, stats?.season_stats.deaths)}\``
		].join("\n"));

	},
};
