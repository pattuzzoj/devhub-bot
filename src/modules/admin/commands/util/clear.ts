import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
	.setName('clear')
	.setDescription('Limpa mensagens do canal')
	.addIntegerOption(option =>
		option.setName('quantidade')
			.setDescription('Quantas mensagens apagar')
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(100)
	)
	.addStringOption(option =>
		option.setName('motivo')
			.setDescription('Por que limpar')
			.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

async function execute(interaction: ChatInputCommandInteraction) {
	const amount = interaction.options.getInteger('quantidade', true);
	const reason = interaction.options.getString('motivo', true);
	
	try {
		const channel = interaction.channel as TextChannel;
		
		if (!channel) {
			return interaction.reply({ 
				content: 'Canal não encontrado.', 
				ephemeral: true 
			});
		}
		
		// Buscar mensagens para deletar
		const messages = await channel.messages.fetch({ limit: amount });
		
		// Filtrar mensagens que não são muito antigas (Discord não permite deletar mensagens com mais de 14 dias)
		const filteredMessages = messages.filter(msg => 
			Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
		);
		
		if (filteredMessages.size === 0) {
			return interaction.reply({ 
				content: 'Não há mensagens para deletar (mensagens muito antigas).', 
				ephemeral: true 
			});
		}
		
		// Deletar mensagens
		await channel.bulkDelete(filteredMessages, true);
		
		await interaction.reply({
			content: `✅ **${filteredMessages.size}** mensagens deletadas.\nMotivo: ${reason}`,
			ephemeral: true
		});

		await sendLog(interaction.client, {
			color: '#aa00aa',
			title: 'Mensagens Limpas',
			description: ' ',
			fields: [{
				name: 'Canal',
				value: `<#${channel.id}>`,
				inline: true
			}, {
				name: 'Quantidade',
				value: `${filteredMessages.size} mensagens`,
				inline: true
			}, {
				name: 'Motivo',
				value: `${reason}`,
				inline: true
			}]
		}, process.env['CLEAR_LOG_ID']!);
		

	} catch (error) {
		console.error('Erro no comando clear:', error);
		return interaction.reply({ 
			content: 'Erro ao limpar mensagens.', 
			ephemeral: true 
		});
	}
}

export default {
	data,
	execute
}