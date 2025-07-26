import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import sendLog from '../../../../shared/utils/log';
import { createCommand } from '../../../../shared/handlers/createCommand';

async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('usuário', true);
  const reason = interaction.options.getString('motivo', true);
  
  const targetMember = interaction.guild!.members.cache.get(targetUser.id);
  
  if (targetMember && !targetMember.kickable) {
    return await interaction.reply({ 
      content: 'Não é possível expulsar este usuário.', 
      ephemeral: true 
    });
  }
  
  try {
    await targetMember?.kick(reason);
    
    await interaction.reply({
			content: `✅ ${targetUser} expulso.\nMotivo: ${reason}`,
			ephemeral: true,
      allowedMentions: {
        users: [targetUser.id]
      }
		});

		await sendLog(interaction.client, {
			color: '#ff8800',
			title: 'Usuário Expulso',
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
		}, process.env['KICK_LOG_ID']!);
  } catch (error) {
    console.error('Erro no comando kick:', error);
    return await interaction.reply({ 
      content: 'Erro ao expulsar usuário.', 
      ephemeral: true 
    });
  }
}

createCommand({
	name: 'kick',
	description: 'Expulsa um usuário',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'usuário',
			description: 'Qual usuário expulsar',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'motivo',
			description: 'Por que expulsar',
			required: true
		}
	],
	defaultPermission: PermissionFlagsBits.KickMembers
}, execute);