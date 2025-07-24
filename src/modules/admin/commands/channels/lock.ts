import { ChannelType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel, VoiceChannel } from "discord.js";
import sendLog from "../../../../shared/utils/log";

const data = new SlashCommandBuilder()
	.setName('lock')
	.setDescription('Bloqueia um canal')
	.addChannelOption(option =>
		option.setName('canal')
			.setDescription('Qual canal bloquear')
			.setRequired(true)
			.addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
	)
	.addStringOption(option =>
		option.setName('motivo')
			.setDescription('Por que bloquear')
			.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

async function execute(interaction: ChatInputCommandInteraction) {
	const targetChannel = (interaction.options.getChannel('canal') || interaction.channel) as TextChannel | VoiceChannel;
	const reason = interaction.options.getString('motivo', true);
	const everyoneRole = interaction.guild!.roles.everyone;

	if (!targetChannel) {
		return interaction.reply({
			content: 'Canal não encontrado.',
			ephemeral: true
		});
	}

	try {
		// Verificar as permissões atuais para @everyone
		const currentPerms = targetChannel.permissionOverwrites.cache.get(everyoneRole.id);

		// Se o canal já estiver bloqueado, informar ao usuário
		if (currentPerms?.deny.has(PermissionFlagsBits.SendMessages)) {
			return interaction.reply({
				content: `Canal <#${targetChannel.id}> já está bloqueado.`,
				ephemeral: true
			});
		}

		// Bloquear o canal para @everyone
		await targetChannel.permissionOverwrites.edit(everyoneRole.id, {
			SendMessages: false
		}, { reason });

		await interaction.reply({
			content: `Canal <#${targetChannel.id}> bloqueado.\nMotivo: ${reason}`,
			ephemeral: true
		});

		// Enviar mensagem no canal bloqueado
		if (targetChannel.id !== interaction.channelId) {
			await targetChannel.send(`Este canal foi bloqueado. Motivo: ${reason}`);
		}

		await sendLog(interaction.client, {
			color: '#dd0000',
			title: 'Canal Bloqueado',
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
		}, process.env['LOCK_LOG_ID']!);
	} catch (error) {
		console.error('Erro no comando lock:', error);
		return interaction.reply({
			content: 'Erro ao bloquear canal.',
			ephemeral: true
		});
	}
}

export default {
	data,
	execute
}