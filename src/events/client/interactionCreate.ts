import { BaseInteraction, ChatInputCommandInteraction, Client } from "discord.js";

export default async (client: Client, interaction: BaseInteraction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = (client.interactions.commands as Record<string, any>)[interaction.commandName];
	if (!command) return;

	try {
		await command.run(interaction as ChatInputCommandInteraction);
	} catch (error) {
		console.error(`Error running /${interaction.commandName}:`, error);

		if (interaction.deferred || interaction.replied) {
			await interaction.editReply("There was an error while running this command.");
			return;
		}

		await interaction.reply({
			content: "There was an error while running this command.",
			ephemeral: true,
		});
	}
};
