import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
	.setName('removerole')
	.setDescription('Remove um cargo de um usuário')
	.addUserOption(option =>
		option.setName('usuário')
			.setDescription('De quem tirar cargo')
			.setRequired(true)
	)
	.addRoleOption(option =>
		option.setName('cargo')
			.setDescription('Qual cargo tirar')
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName('motivo')
			.setDescription('Por que tirar cargo')
			.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

async function execute(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser('usuário', true);
	const role = interaction.options.getRole('cargo', true);
	const reason = interaction.options.getString('motivo', true);

	const targetMember = interaction.guild!.members.cache.get(targetUser.id);

	if (!targetMember) {
		return interaction.reply({
			content: 'Usuário não encontrado no servidor.',
			ephemeral: true
		});
	}

	// Verificar se o usuário possui o cargo
	if (!targetMember.roles.cache.has(role.id)) {
		return interaction.reply({
			content: `${targetUser} não possui o cargo ${role}.`,
			ephemeral: true,
      allowedMentions: {
        users: [targetUser.id],
				roles: [role.id]
      }
		});
	}

	// Verificar se o bot pode gerenciar o cargo
	if (role.position >= interaction.guild!.members.me!.roles.highest.position) {
		return interaction.reply({
			content: 'Não é possível remover este cargo (posição muito alta).',
			ephemeral: true
		});
	}

	// Verificar se o usuário pode gerenciar o cargo
	if (role.position >= (interaction.member as any).roles.highest.position && interaction.user.id !== interaction.guild!.ownerId) {
		return interaction.reply({
			content: 'Você não pode remover este cargo (posição muito alta).',
			ephemeral: true
		});
	}

	try {
		await targetMember.roles.remove(role.id, reason);

		await interaction.reply({
			content: `✅ Cargo ${role} removido de ${targetUser}.\nMotivo: ${reason}`,
			ephemeral: true,
      allowedMentions: {
        users: [targetUser.id],
				roles: [role.id]
      }
		});

		await sendLog(interaction.client, {
			color: '#ff4400',
			title: 'Cargo Removido',
			description: ' ',
			fields: [{
				name: 'Usuário',
				value: `<@${targetUser.id}>`,
				inline: true
			}, {
				name: 'Cargo',
				value: `<@&${role.id}>`,
				inline: true
			}, {
				name: 'Motivo',
				value: `${reason}`,
				inline: true
			}]
		}, process.env['REMOVEROLE_LOG_ID']!);
	} catch (error) {
		console.error('Erro no comando removerole:', error);
		return interaction.reply({
			content: 'Erro ao remover cargo.',
			ephemeral: true
		});
	}
}

export default {
	data,
	execute
}