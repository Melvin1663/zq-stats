import {
	APIApplicationCommandBasicOption,
	ChatInputCommandInteraction,
} from "discord.js";

export interface Command {
	name: string;
	description: string;
	category?: "dev" | "fun" | "info" | "mod" | "test" | "util";
	options?: APIApplicationCommandBasicOption[];
	type?: number;
	subCommand?: boolean;
	default_member_permissions?: bigint;
	disabled?: boolean;
	run(int: ChatInputCommandInteraction): any; // uh
}

export interface CommandJSON {
	cmd: string;
	do: string;
	data: any;
}