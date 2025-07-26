import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import sendLog from '../../../../shared/utils/log';
import { createCommand } from '../../../../shared/handlers/createCommand';

async function execute(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser('usuário', true);
	const reason = interaction.options.getString('motivo', true);
	
	const targetMember = interaction.guild!.members.cache.get(targetUser.id);
	
	// Verificar se o usuário está em um canal de voz
	const voiceState = targetMember?.voice;
	
	if (!voiceState?.channelId) {
		return await interaction.reply({ 
			content: 'Usuário não está em canal de voz.', 
			ephemeral: true 
		});
	}
	
	// Verificar se o usuário está mutado
	// if (!voiceState.mute) {
	// 	return await interaction.reply({ 
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
		return await interaction.reply({ 
			content: 'Erro ao desmutar usuário.', 
			ephemeral: true 
		});
	}
}

createCommand({
	name: 'unmute',
	description: 'Remove silenciamento de um usuário',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'usuário',
			description: 'Qual usuário desmutar',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'motivo',
			description: 'Por que desmutar',
			required: true
		}
	],
	defaultPermission: PermissionFlagsBits.ModerateMembers
}, execute);