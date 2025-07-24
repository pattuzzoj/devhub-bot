import { Client, ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";

export default async function sendLog(client: Client<boolean>, data: {
  color: ColorResolvable;
  title: string;
  description: string;
  fields: {
    name: string;
    value: string;
    inline: boolean;
  }[];
}, channelId: string) {
  const channel = await client.channels.fetch(channelId) as TextChannel;

  const embed = new EmbedBuilder()
    .setColor(data.color)
    .setTitle(data.title)
    .setDescription(data.description)
    .addFields(data.fields)
    .setFooter({
      text: 'Dev Hub'
    })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}
