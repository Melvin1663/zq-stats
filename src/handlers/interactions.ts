import { ApplicationCommandOption } from "discord.js";
import { Dirent, readdirSync } from "fs";
import client from '../../index.js'

const excludeFields = ['run', 'disabled'];

export default async () => {
	const types = readdirSync('./build/src/interactions/');

	for (const type of types) {
		switch (type) {
			case 'commands': {
				const search = async (path: string) => {
					await Promise.all(readdirSync(path, { withFileTypes: true })
						.filter((x: Dirent) => x.isDirectory())
						.map((x: Dirent) => x.name) // get all directories
						.map((dir: string) => search(`${path}${dir}/`)));// runs this function in that directory if theres any

					await Promise.all(readdirSync(path)
						.filter((file: string) => file.endsWith('.js')) // get all js files (when compiled)
						.map(async (file: string) => {
							// handles files
							const { default: cmd } = await import(`${path}${file}`.replace('./build/src/interactions/', '../interactions/')); // ./build/src/interactions/ = ../interactions/
							if (cmd?.type == 1 || cmd?.type == 2) return;
							if (cmd?.subCommand) {
								// sub commands
								let newOptions: ApplicationCommandOption[] = [];
								await Promise.all(
									readdirSync(`${path}${cmd.name}/`)
										.filter((f: string) => f.endsWith('.js'))
										.map(async (f: string) => {
											// Sub comamnd group file
											const { default: scf } = await import(`${path}${cmd.name}/${f}`.replace('./build/src/interactions/', '../interactions/')) // ./build/src/interactions/ = ../interactions/

											if (scf?.name && scf?.type) {
												if (scf.type == 2) {
													// if sub command group
													await Promise.all(
														readdirSync(`${path}${cmd.name}/${scf.name}/`)
															.filter((f: string) => f.endsWith('.js'))
															.map(async (g: string) => {
																// if nested sub command
																const { default: sc } = await import(`${path}${cmd.name}/${scf.name}/${g}`.replace('./build/src/interactions/', '../interactions/')) // ./build/src/interactions/ = ../interactions/
																if (sc?.name && sc?.type) {
																	let obj = Object.assign({}, sc)
																	excludeFields.forEach((f: string) => delete obj[f]);
																	if (scf.options) scf.options.push(obj)
																	else scf.options = [obj];
																}
															})
													)
													let objMain = Object.assign({}, scf) // Making a copy of scf
													excludeFields.forEach((f: string) => delete objMain[f]);
													newOptions.push(objMain);
												} else if (scf.type == 1) {
													// if sub command
													let objMain = Object.assign({}, scf) // Making a copy of scf
													excludeFields.forEach((f: string) => delete objMain[f]);
													newOptions.push(objMain);
												}
											}
										})
								)
								cmd.options = newOptions;
							}
							if (!cmd?.disabled && cmd?.name) {
								cmd.options = cmd.options ?? [];
								(client.interactions.commands as Record<string, unknown>)[cmd.name as string] = cmd;
							}
						}))
				}

				await search(`./build/src/interactions/${type}/`);
			}; break;
			case 'context': {
				const kinds = readdirSync(`./build/src/interactions/${type}/`);
				for (const kind of kinds) {
					const ctxFiles = readdirSync(`./build/src/interactions/${type}/${kind}`);
					for await (const ctxFile of ctxFiles) {
						const { default: ctx } = await import(`../interactions/${type}/${kind}/${ctxFile}`);

						const typeKey = ctx.type as keyof typeof client.interactions.context;
						const nameKey = ctx.name as string;
						(client.interactions.context[typeKey] as Record<string, any>)[nameKey] = {
							name: ctx.name,
							type: ctx.type,
							description: ctx.description,
							run: ctx.run
						}
					}
				}
			}
		}
	}
}
