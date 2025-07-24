import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
	.setName('unmute')
	.setDescription('Remove silenciamento de um usuário')
	.addUserOption(option =>
		option.setName('usuário')
			.setDescription('Qual usuário desmutar')
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName('motivo')
			.setDescription('Por que desmutar')
			.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

async function execute(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser('usuário', true);
	const reason = interaction.options.getString('motivo', true);
	
	const targetMember = interaction.guild!.members.cache.get(targetUser.id);
	
	// Verificar se o usuário está em um canal de voz
	const voiceState = targetMember?.voice;
	
	if (!voiceState?.channelId) {
		return interaction.reply({ 
			content: 'Usuário não está em canal de voz.', 
			ephemeral: true 
		});
	}
	
	// Verificar se o usuário está mutado
	// if (!voiceState.mute) {
	// 	return interaction.reply({ 
	// 		content: 'Usuário não está mutado.', 
	// 		ephemeral: true 
	// 	});
	// }
	
	try {
		// Desmutar o usuário
		await targetMember?.voice.setMute(false, reason);
		
		await interaction.reply({
			content: `✅ ${targetUser} desmutado.\nMotivo: ${reason}`,
			ephemeral: true,
      allowedMentions: {
        users: [targetUser.id]
      }
		});

		await sendLog(interaction.client, {
			color: '#00dd00',
			title: 'Usuário Desmutado (Voz)',
			description: ' ',
			fields: [{
				name: 'Usuário',
				value: `<@${targetUser.id}>`,
				inline: true
			}, {
				name: 'Motivo',
				value: `${reason}`,
				inline: true
			}]
		}, process.env['UNMUTE_LOG_ID']!);
	} catch (error) {
		console.error('Erro no comando unmute:', error);
		return interaction.reply({ 
			content: 'Erro ao desmutar usuário.', 
			ephemeral: true 
		});
	}
}

export default {
	data,
	execute
}