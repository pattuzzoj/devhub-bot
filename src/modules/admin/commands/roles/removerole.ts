import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import sendLog from '../../../../shared/utils/log';
import { createCommand } from '../../../../shared/handlers/createCommand';

async function execute(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser('usuário', true);
	const role = interaction.options.getRole('cargo', true);
	const reason = interaction.options.getString('motivo', true);

	const targetMember = interaction.guild!.members.cache.get(targetUser.id);

	if (!targetMember) {
		return await interaction.reply({
			content: 'Usuário não encontrado no servidor.',
			ephemeral: true
		});
	}

	// Verificar se o usuário possui o cargo
	if (!targetMember.roles.cache.has(role.id)) {
		return await interaction.reply({
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
		return await interaction.reply({
			content: 'Não é possível remover este cargo (posição muito alta).',
			ephemeral: true
		});
	}

	// Verificar se o usuário pode gerenciar o cargo
	if (role.position >= (interaction.member as any).roles.highest.position && interaction.user.id !== interaction.guild!.ownerId) {
		return await interaction.reply({
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
		return await interaction.reply({
			content: 'Erro ao remover cargo.',
			ephemeral: true
		});
	}
}

createCommand({
	name: 'removerole',
	description: 'Remove um cargo de um usuário',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'usuário',
			description: 'De quem tirar cargo',
			required: true
		},
		{
			type: ApplicationCommandOptionType.Role,
			name: 'cargo',
			description: 'Qual cargo tirar',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'motivo',
			description: 'Por que tirar cargo',
			required: true
		}
	],
	defaultPermission: PermissionFlagsBits.ManageRoles
}, execute);