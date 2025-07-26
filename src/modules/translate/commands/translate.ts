import { ChatInputCommandInteraction, PermissionFlagsBits, ApplicationCommandOptionType } from 'discord.js';
import getTranslateResponse from '../services/getTranslateResponse';
import { createCommand } from '../../../shared/handlers/createCommand';

const supportedLanguages = new Map([
	["pt", "Português"],
	["es", "Espanhol"],
	["it", "Italiano"],
  ["fr", "Francês"],
  ["en", "Inglês"]
]);

const choices = Array.from(supportedLanguages.entries(), (([key, value]) => ({
	name: value,
	value: key
})));

async function execute(interaction: ChatInputCommandInteraction) {
	const text = interaction.options.getString('texto', true);
	const targetLanguage = interaction.options.getString('idioma', true);

	try {
		const translatedData = await getTranslateResponse(text, targetLanguage);
		const translatedText = translatedData.translatedText;
		const sourceLanguage = translatedData.detectedSourceLanguage;

		await interaction.reply({
			content: `Traduzido de ${supportedLanguages.get(sourceLanguage)} para ${supportedLanguages.get(targetLanguage)}:\n${translatedText}`,
			ephemeral: false
		});
	} catch (error) {
		console.error('Error in translate command:', error);
		return await interaction.reply({
			content: 'Error while translating text.',
			ephemeral: true
		});
	}
}

createCommand({
	name: 'translate',
	description: 'Traduz o texto para o idioma especificado',
	options: [
		{
			name: 'texto',
			description: 'Texto a ser traduzido',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'idioma',
			description: 'Idioma para tradução',
			type: ApplicationCommandOptionType.String,
			choices: choices,
			required: true,
		}
	],
	defaultPermission: PermissionFlagsBits.ManageChannels
}, execute);