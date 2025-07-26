import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import sendLog from '../../../../shared/utils/log';
import { createCommand } from '../../../../shared/handlers/createCommand';

async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('usuário', true);
  const duration = interaction.options.getInteger('duracao', true);
  const reason = interaction.options.getString('motivo', true);
  
  const targetMember = interaction.guild!.members.cache.get(targetUser.id);
  
  if (targetMember && !targetMember.moderatable) {
    return await interaction.reply({ 
      content: 'Não é possível aplicar timeout neste usuário.', 
      ephemeral: true 
    });
  }
  
  try {
    if (duration === 0) {
      // Desmutar usuário passando null
      await targetMember?.timeout(null, reason);
      
      await interaction.reply({
        content: `✅ ${targetUser} foi desmutado.\nMotivo: ${reason}`,
        ephemeral: true,
        allowedMentions: {
          users: [targetUser.id]
        }
      });

      await sendLog(interaction.client, {
        color: '#00dd00',
        title: 'Usuário Desmutado (Timeout)',
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
      }, process.env['TIMEOUT_LOG_ID']!);
    } else {
      // Converter minutos para milissegundos
      const timeoutDuration = duration * 60 * 1000;
      
      await targetMember?.timeout(timeoutDuration, reason);
      
      await interaction.reply({
        content: `✅ ${targetUser} recebeu timeout de ${duration} minutos.\nMotivo: ${reason}`,
        ephemeral: true,
        allowedMentions: {
          users: [targetUser.id]
        }
      });

      await sendLog(interaction.client, {
        color: '#dd6600',
        title: 'Usuário com Timeout',
        description: ' ',
        fields: [{
          name: 'Usuário',
          value: `<@${targetUser.id}>`,
          inline: true
        }, {
          name: 'Duração',
          value: `${duration} minutos`,
          inline: true
        }, {
          name: 'Motivo',
          value: `${reason}`,
          inline: true
        }]
      }, process.env['TIMEOUT_LOG_ID']!);
    }
  } catch (error) {
    console.error('Erro no comando timeout:', error);
    return await interaction.reply({ 
      content: 'Erro ao aplicar timeout.', 
      ephemeral: true 
    });
  }
}

createCommand({
	name: 'timeout',
	description: 'Aplica timeout em um usuário',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'usuário',
			description: 'Qual usuário silenciar',
			required: true
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'duracao',
			description: 'Quantos minutos (0 para desmutar)',
      minLength: 1,
      maxLength: 1500,
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'motivo',
			description: 'Por que silenciar',
			required: true
		}
	],
	defaultPermission: PermissionFlagsBits.ModerateMembers
}, execute);