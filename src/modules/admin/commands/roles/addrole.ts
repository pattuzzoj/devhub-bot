import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import sendLog from '../../../../shared/utils/log';

const data = new SlashCommandBuilder()
	.setName('addrole')
	.setDescription('Adiciona um cargo a um usuário')
	.addUserOption(option =>
		option.setName('usuário')
			.setDescription('Para quem dar cargo')
			.setRequired(true)
	)
	.addRoleOption(option =>
		option.setName('cargo')
			.setDescription('Qual cargo dar')
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName('motivo')
			.setDescription('Por que dar cargo')
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

	// Verificar se o cargo já está no usuário
	if (targetMember.roles.cache.has(role.id)) {
		return interaction.reply({
			content: `<@${targetUser.id}> já possui o cargo <@&${role.id}>.`,
			ephemeral: true
		});
	}

	// Verificar se o bot pode gerenciar o cargo
	if (role.position >= interaction.guild!.members.me!.roles.highest.position) {
		return interaction.reply({
			content: 'Não é possível adicionar este cargo (posição muito alta).',
			ephemeral: true
		});
	}

	// Verificar se o usuário pode gerenciar o cargo
	if (role.position >= (interaction.member as any).roles.highest.position && interaction.user.id !== interaction.guild!.ownerId) {
		return interaction.reply({
			content: 'Você não pode adicionar este cargo (posição muito alta).',
			ephemeral: true
		});
	}

	try {
		await targetMember.roles.add(role.id, reason);

		await interaction.reply({
			content: `✅ Cargo ${role} adicionado a ${targetUser}.\nMotivo: ${reason}`,
			ephemeral: true,
      allowedMentions: {
        users: [targetUser.id],
				roles: [role.id]
      }
		});

		await sendLog(interaction.client, {
			color: '#0088ff',
			title: 'Cargo Adicionado',
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
		}, process.env['ADDROLE_LOG_ID']!);
	} catch (error) {
		console.error('Erro no comando addrole:', error);
		return interaction.reply({
			content: 'Erro ao adicionar cargo.',
			ephemeral: true
		});
	}
}

export default {
	data,
	execute
}