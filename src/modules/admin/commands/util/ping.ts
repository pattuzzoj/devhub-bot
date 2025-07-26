// import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

// const data = new SlashCommandBuilder()
// 	.setName('ping')
// 	.setDescription('Responde com pong!');

// async function execute(interaction: ChatInputCommandInteraction) {
// 	const sent = await interaction.reply({ content: 'Pong!', fetchReply: true });
// 	const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
// 	const apiLatency = Math.round(interaction.client.ws.ping);

// 	await interaction.editReply(`🏓 Pong!\n📡 Latência: ${roundtripLatency}ms\n💓 API: ${apiLatency}ms`);
// }

// export default {
// 	data,
// 	execute
// }