import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Desbane um usuário')
  .addStringOption(option => 
    option.setName('user_id')
      .setDescription('ID do usuário')
      .setRequired(true)
  )
  .addStringOption(option => 
    option.setName('motivo')
      .setDescription('Por que desbanir')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.options.getString('user_id', true);
  const reason = interaction.options.getString('motivo', true);
  
  // Verificar se o ID é válido
  if (!/^\d{17,19}$/.test(userId)) {
    return interaction.reply({ 
      content: 'ID de usuário inválido.', 
      ephemeral: true 
    });
  }
  
  try {
    // Obter a lista de banimentos
    const bans = await interaction.guild?.bans.fetch();
    const bannedUser = bans?.get(userId);
    
    // Verificar se o usuário está banido
    if (!bannedUser) {
      return interaction.reply({ 
        content: 'Usuário não está banido.', 
        ephemeral: true 
      });
    }
    
    // Desbanir o usuário
    await interaction.guild?.members.unban(userId, reason);
    
    await interaction.reply({
			content: `✅ ${bannedUser.user} desbanido.\nMotivo: ${reason}`,
			ephemeral: true,
      allowedMentions: {
        users: [bannedUser.user.id]
      }
		});

		await sendLog(interaction.client, {
			color: '#00dd00',
			title: 'Usuário Desbanido',
			description: ' ',
			fields: [{
				name: 'Usuário',
				value: `<@${bannedUser.user.id}>`,
				inline: true
			}, {
				name: 'Motivo',
				value: `${reason}`,
				inline: true
			}]
		}, process.env['UNBAN_LOG_ID']!);
  } catch (error) {
    console.error('Erro no comando unban:', error);
    return interaction.reply({ 
      content: 'Erro ao desbanir usuário.', 
      ephemeral: true 
    });
  }
}

export default {
	data,
	execute
}