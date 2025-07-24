import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel, VoiceState } from "discord.js";
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
	.setName('mute')
	.setDescription('Silencia um usuário')
	.addUserOption(option =>
		option.setName('usuário')
			.setDescription('Qual usuário mutar')
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName('motivo')
			.setDescription('Por que mutar')
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
  
  // Verificar se o bot tem permissão para mutar o usuário
  if (!voiceState.channel?.permissionsFor(interaction.guild!.members.me!)?.has(PermissionFlagsBits.MuteMembers)) {
    return interaction.reply({ 
      content: 'Não é possível mutar este usuário.', 
      ephemeral: true 
    });
  }
  
  try {
		// Mutar o usuário
		await targetMember?.voice.setMute(true, reason);
		
		await interaction.reply({
			content: `✅ ${targetUser} mutado.\nMotivo: ${reason}`,
			ephemeral: true,
      allowedMentions: {
        users: [targetUser.id]
      }
		});

		await sendLog(interaction.client, {
			color: '#ffaa00',
			title: 'Usuário Mutado (Voz)',
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
		}, process.env['MUTE_LOG_ID']!);
	} catch (error) {
    console.error('Erro no comando mute:', error);
    return interaction.reply({ 
      content: 'Erro ao mutar usuário.', 
      ephemeral: true 
    });
  }
}

export default {
	data,
	execute
}