import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Expulsa um usuário')
  .addUserOption(option => 
		option.setName('usuário')
			.setDescription('Qual usuário expulsar')
			.setRequired(true)
	)
	.addStringOption(option => 
		option.setName('motivo')
			.setDescription('Por que expulsar')
			.setRequired(true)
	)
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('usuário', true);
  const reason = interaction.options.getString('motivo', true);
  
  const targetMember = interaction.guild!.members.cache.get(targetUser.id);
  
  if (targetMember && !targetMember.kickable) {
    return interaction.reply({ 
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
    return interaction.reply({ 
      content: 'Erro ao expulsar usuário.', 
      ephemeral: true 
    });
  }
}

export default {
	data,
	execute
}