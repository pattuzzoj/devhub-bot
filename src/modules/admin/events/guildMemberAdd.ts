import { Events, GuildMember, EmbedBuilder, TextChannel } from 'discord.js';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    const welcomeChannelId = '1397821962121904309';
    
    try {
      const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel;
      
      if (!welcomeChannel) {
        console.warn(`Canal de boas-vindas ${welcomeChannelId} não encontrado`);
        return;
      }
      
      const welcomeEmbed = new EmbedBuilder()
        .setTitle('Bem-vindo(a) ao servidor!')
        .setDescription(`Olá ${member}, seja muito bem-vindo(a) ao **${member.guild.name}**!\n\nEsperamos que você se divirta e faça parte da nossa comunidade.`)
        .setColor('#14172E')
        // @ts-ignore
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        // @ts-ignore
        .setImage(member.guild.bannerURL({ dynamic: true, size: 1024 }) || null)
        .setFooter({ 
          text: `${member.guild.name} • Boas-vindas`, 
          iconURL: member.guild.iconURL() || undefined 
        })
        .setTimestamp();

      await welcomeChannel.send({ 
        content: `${member} acabou de entrar! 🎊`,
        embeds: [welcomeEmbed] 
      });

      console.log(`Mensagem de boas-vindas enviada para ${member.user.tag}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem de boas-vindas:', error);
    }
  },
};