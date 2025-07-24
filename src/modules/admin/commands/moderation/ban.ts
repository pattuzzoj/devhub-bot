import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bane um usuário')
  .addUserOption(option => 
		option.setName('usuário')
			.setDescription('Qual usuário banir')
			.setRequired(true)
	)
	.addStringOption(option => 
		option.setName('motivo')
			.setDescription('Por que banir')
			.setRequired(true)
	)
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('usuário', true);
  const reason = interaction.options.getString('motivo', true);
  const deleteMessageDays = 7;
  
  const targetMember = interaction.guild!.members.cache.get(targetUser.id);
  
  if (targetMember && !targetMember.bannable) {
    return interaction.reply({ 
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
    return interaction.reply({ 
      content: 'Erro ao banir usuário.', 
      ephemeral: true 
    });
  }
}

export default {
	data,
	execute
}