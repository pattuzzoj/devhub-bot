import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Aplica timeout em um usuário')
  .addUserOption(option => 
    option.setName('usuário')
      .setDescription('Qual usuário silenciar')
      .setRequired(true)
  )
  .addIntegerOption(option => 
    option.setName('duracao')
      .setDescription('Quantos minutos (0 para desmutar)')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(40320)
  )
  .addStringOption(option => 
    option.setName('motivo')
      .setDescription('Por que silenciar')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('usuário', true);
  const duration = interaction.options.getInteger('duracao', true);
  const reason = interaction.options.getString('motivo', true);
  
  const targetMember = interaction.guild!.members.cache.get(targetUser.id);
  
  if (targetMember && !targetMember.moderatable) {
    return interaction.reply({ 
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
    return interaction.reply({ 
      content: 'Erro ao aplicar timeout.', 
      ephemeral: true 
    });
  }
}

export default {
	data,
	execute
}