import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import sendLog from '../../../../shared/utils/log';
import { createCommand } from '../../../../shared/handlers/createCommand';

async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.options.getString('user_id', true);
  const reason = interaction.options.getString('motivo', true);
  
  // Verificar se o ID é válido
  if (!/^\d{17,19}$/.test(userId)) {
    return await interaction.reply({ 
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
      return await interaction.reply({ 
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
    return await interaction.reply({ 
      content: 'Erro ao desbanir usuário.', 
      ephemeral: true 
    });
  }
}

createCommand({
	name: 'unban',
	description: 'Desbane um usuário',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'user_id',
			description: 'ID do usuário',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'motivo',
			description: 'Por que desbanir',
			required: true
		}
	],
	defaultPermission: PermissionFlagsBits.BanMembers
}, execute);