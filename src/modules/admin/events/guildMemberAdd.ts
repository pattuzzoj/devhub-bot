import { GuildMember, EmbedBuilder, TextChannel, Events } from 'discord.js';
import { createEvent } from '../../../shared/handlers/createEvent';

async function execute(member: GuildMember) {
  const welcomeChannelId = '1397821962121904309';
  
  try {
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel;
    
    if (!welcomeChannel) {
      console.warn(`Canal de boas-vindas ${welcomeChannelId} não encontrado`);
      return;
    }
    
    const welcomeEmbed = new EmbedBuilder()
      .setTitle('Bem-vindo(a) ao servidor!')
      .setDescription(`Olá, <@${member.id}>! Bem-vindo(a) ao DevHub! Aqui você aprende, compartilha e cresce com outros devs. Conte com o Hubby AI para novidades e respostas rápidas. Aproveite!`)
      .setColor('#14172E')
      // @ts-ignore
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      // @ts-ignore
      .setImage(member.guild.client.user.bannerURL({ size: 768 }) || null)
      .setFooter({ 
        text: `${member.guild.name} • Boas-vindas`, 
        iconURL: member.guild.iconURL() || undefined 
      })
      .setTimestamp();

    await welcomeChannel.send({
      embeds: [welcomeEmbed]
    });

    console.log(`Mensagem de boas-vindas enviada para ${member.user.tag}`);
  } catch (error) {
    console.error('Erro ao enviar mensagem de boas-vindas:', error);
  }
}

createEvent(Events.GuildMemberAdd, execute);