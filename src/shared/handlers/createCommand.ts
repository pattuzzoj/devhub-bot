import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, Collection, SlashCommandBuilder } from "discord.js";

interface Choice {
	name: string,
	value: string
}

interface Options {
	type: ApplicationCommandOptionType,
	name: string,
	description: string,
	choices?: Choice[],
	channelTypes?: ChannelType[],
	minLength?: number,
	maxLength?: number,
	required: boolean,
}

interface CreateCommandProps {
	name: string,
	description: string,
	options: Options[],
	defaultPermission?: bigint,
}

const commandOption = {
	1: "addSubcommand",
	2: "addSubcommandGroup",
	3: "addStringOption",
	4: "addIntegerOption",
	5: "addBooleanOption",
	6: "addUserOption",
	7: "addChannelOption",
	8: "addRoleOption",
	9: "addMentionableOption",
	10: "addNumberOption",
	11: "addAttachmentOption",
}

export const commands = new Collection();

export function createCommand(data: CreateCommandProps, execute: (interaction: ChatInputCommandInteraction) => Promise<any>) {
	const command = new SlashCommandBuilder()
		.setName(data.name)
		.setDescription(data.description)
		.setDefaultMemberPermissions(data.defaultPermission);

	for (const {type, name, description, minLength, maxLength, choices, channelTypes, required} of data.options) {
		// @ts-ignore
		command[commandOption[type]]((option) => {
			if (choices) {
				option.addChoices(...choices);
			}

			if (channelTypes) {
				option.addChannelTypes(...channelTypes);
			}

			if (type === ApplicationCommandOptionType.String && (minLength || maxLength)) {
				option.setMinLength(minLength);
				option.setMaxLength(maxLength);
			}

			option.setName(name)
				.setDescription(description)
				.setRequired(required);

			return option;
		})
	}

	commands.set(command.name, {
    data: command,
    execute: execute,
  });

	console.log(`Comando ${data.name} carregado`);
}