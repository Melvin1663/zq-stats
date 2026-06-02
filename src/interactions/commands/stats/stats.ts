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
    description: "Shows a player's Zeqa stats",
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

        const startTime = performance.now();

        const response = await fetch(`https://app.zeqa.net/api/player/stats/name/${encodeURIComponent(username)}`);

        const apiEndTime = performance.now();

        if (response.status === 404) {
            await int.editReply(`Player \`${username}\` not found.`);
            return;
        }

        if (!response.ok) {
            await int.editReply(`Zeqa API returned error: ${response.status}.`);
            return;
        }

        const data = await response.json() as ApiResponse<PlayerStats>;

        if (data.err) {
            await int.editReply(`Zeqa API error: ${data.err}.`);
            return;
        }

        const lifetime = data.result?.lifetime;
        const season = data.result?.season_stats;

        await int.editReply([
            `**Zeqa Stats: ${username}**`,
            "",
            "**Lifetime**",
            `Kills: \`${lifetime?.kills}\``,
            `Deaths: \`${lifetime?.deaths}\``,
            `K/D: \`${ratio(lifetime?.kills, lifetime?.deaths)}\``,
            `Coins: \`${lifetime?.coins}\``,
            `Shards: \`${lifetime?.shards}\``,
            `BP: \`${lifetime?.bp}\``,
            "",
            "**Season**",
            `Kills: \`${season?.kills}\``,
            `Deaths: \`${season?.deaths}\``,
            `K/D: \`${ratio(season?.kills, season?.deaths)}\``,
            "",
            `Command executed in \`${(performance.now() - startTime).toFixed(2)}ms.\``,
            `API response time: \`${(apiEndTime - startTime).toFixed(2)}ms.\``,
        ].join("\n"));

    },
};
