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

	// Verificar se o cargo já está no usuário
	if (targetMember.roles.cache.has(role.id)) {
		return await interaction.reply({
			content: `<@${targetUser.id}> já possui o cargo <@&${role.id}>.`,
			ephemeral: true
		});
	}

	// Verificar se o bot pode gerenciar o cargo
	if (role.position >= interaction.guild!.members.me!.roles.highest.position) {
		return await interaction.reply({
			content: 'Não é possível adicionar este cargo (posição muito alta).',
			ephemeral: true
		});
	}

	// Verificar se o usuário pode gerenciar o cargo
	if (role.position >= (interaction.member as any).roles.highest.position && interaction.user.id !== interaction.guild!.ownerId) {
		return await interaction.reply({
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
		return await interaction.reply({
			content: 'Erro ao adicionar cargo.',
			ephemeral: true
		});
	}
}

createCommand({
	name: 'addrole',
	description: 'Adiciona um cargo a um usuário',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'usuário',
			description: 'Para quem dar cargo',
			required: true
		},
		{
			type: ApplicationCommandOptionType.Role,
			name: 'cargo',
			description: 'Qual cargo dar',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'motivo',
			description: 'Por que dar cargo',
			required: true
		}
	],
	defaultPermission: PermissionFlagsBits.ManageRoles
}, execute);