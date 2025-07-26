import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import sendLog from '../../../../shared/utils/log';
import { createCommand } from '../../../../shared/handlers/createCommand';

async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('usuário', true);
  const reason = interaction.options.getString('motivo', true);
  const deleteMessageDays = 7;
  
  const targetMember = interaction.guild!.members.cache.get(targetUser.id);
  
  if (targetMember && !targetMember.bannable) {
    return await interaction.reply({ 
      content: 'Não é possível banir este usuário.', 
      ephemeral: true 
    });
  }
  
  try {
    await interaction.guild?.members.ban(targetUser, {
      deleteMessageSeconds: deleteMessageDays * 86400, // Convertendo dias para segundos
      reason: reason
    });
    
    await interaction.reply({
			content: `✅ ${targetUser} banido.\nMotivo: ${reason}`,
			ephemeral: true,
      allowedMentions: {
        users: [targetUser.id]
      }
		});

		await sendLog(interaction.client, {
			color: '#dd0000',
			title: 'Usuário Banido',
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
		}, process.env['BAN_LOG_ID']!);
  } catch (error) {
    console.error('Erro no comando ban:', error);
    return await interaction.reply({ 
      content: 'Erro ao banir usuário.', 
      ephemeral: true 
    });
  }
}

createCommand({
	name: 'ban',
	description: 'Bane um usuário',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'usuário',
			description: 'Qual usuário banir',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'motivo',
			description: 'Por que banir',
			required: true
		}
	],
	defaultPermission: PermissionFlagsBits.BanMembers
}, execute);