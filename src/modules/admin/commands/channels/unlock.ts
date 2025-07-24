import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType, TextChannel } from 'discord.js';
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
	.setName('unlock')
	.setDescription('Desbloqueia um canal')
	.addChannelOption(option =>
		option.setName('canal')
			.setDescription('Qual canal desbloquear')
			.setRequired(true)
			.addChannelTypes(ChannelType.GuildText)
	)
	.addStringOption(option =>
		option.setName('motivo')
			.setDescription('Por que desbloquear')
			.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

async function execute(interaction: ChatInputCommandInteraction) {
	const targetChannel = (interaction.options.getChannel('canal') || interaction.channel) as TextChannel;
	const reason = interaction.options.getString('motivo', true);
	const everyoneRole = interaction.guild!.roles.everyone;
	
	if (!targetChannel) {
		return interaction.reply({ 
			content: 'Canal não encontrado.', 
			ephemeral: true 
		});
	}
	
	// Verificar se o canal é um canal de texto
	if (targetChannel.type !== ChannelType.GuildText) {
		return interaction.reply({ 
			content: 'Este comando só pode ser usado em canais de texto.', 
			ephemeral: true 
		});
	}
	
	try {
		// Verificar as permissões atuais para @everyone
		const currentPerms = targetChannel.permissionOverwrites.cache.get(everyoneRole.id);

		// Se o canal não estiver bloqueado, informar ao usuário
		if (!currentPerms?.deny.has(PermissionFlagsBits.SendMessages)) {
			return interaction.reply({
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
		return interaction.reply({ 
			content: 'Erro ao desbloquear canal.', 
			ephemeral: true 
		});
	}
}

export default {
	data,
	execute
}