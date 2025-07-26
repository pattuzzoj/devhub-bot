import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from 'discord.js';
import sendLog from '../../../../shared/utils/log';
import { createCommand } from '../../../../shared/handlers/createCommand';

async function execute(interaction: ChatInputCommandInteraction) {
	const targetChannel = (interaction.options.getChannel('canal') || interaction.channel) as TextChannel;
	const reason = interaction.options.getString('motivo', true);
	const everyoneRole = interaction.guild!.roles.everyone;
	
	if (!targetChannel) {
		return await interaction.reply({ 
			content: 'Canal não encontrado.', 
			ephemeral: true 
		});
	}
	
	// Verificar se o canal é um canal de texto
	if (targetChannel.type !== ChannelType.GuildText) {
		return await interaction.reply({ 
			content: 'Este comando só pode ser usado em canais de texto.', 
			ephemeral: true 
		});
	}
	
	try {
		// Verificar as permissões atuais para @everyone
		const currentPerms = targetChannel.permissionOverwrites.cache.get(everyoneRole.id);

		// Se o canal não estiver bloqueado, informar ao usuário
		if (!currentPerms?.deny.has(PermissionFlagsBits.SendMessages)) {
			return await interaction.reply({
				content: `Canal <#${targetChannel.id}> não está bloqueado.`,
				ephemeral: true
			});
		}

		// Desbloquear o canal para @everyone
		await targetChannel.permissionOverwrites.edit(everyoneRole.id, {
			SendMessages: null // Remover a sobrescrita de permissão
		}, { reason });

		await interaction.reply({
			content: `✅ Canal <#${targetChannel.id}> desbloqueado.\nMotivo: ${reason}`,
			ephemeral: true
		});

		// Enviar mensagem no canal desbloqueado
		if (targetChannel.id !== interaction.channelId) {
			await targetChannel.send(`🔓 Este canal foi desbloqueado. Motivo: ${reason}`);
		}

		await sendLog(interaction.client, {
			color: '#00dd00',
			title: 'Canal Desbloqueado',
			description: ' ',
			fields: [{
				name: 'Canal',
				value: `<#${targetChannel.id}>`,
				inline: true
			}, {
				name: 'Motivo',
				value: `${reason}`,
				inline: true
			}]
		}, process.env['UNLOCK_LOG_ID']!);
	} catch (error) {
		console.error('Erro no comando unlock:', error);
		return await interaction.reply({ 
			content: 'Erro ao desbloquear canal.', 
			ephemeral: true 
		});
	}
}

createCommand({
	name: 'unlock',
	description: 'Desbloqueia um canal',
	options: [
		{
			type: ApplicationCommandOptionType.Channel,
			name: 'canal',
			description: 'Qual canal desbloquear',
			required: true,
			channelTypes: [ChannelType.GuildText]
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'motivo',
			description: 'Por que desbloquear',
			required: true,
		}
	],
	defaultPermission: PermissionFlagsBits.ManageChannels
}, execute);