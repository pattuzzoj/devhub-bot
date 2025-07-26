import { Events, Interaction } from 'discord.js';
import { createEvent } from '../handlers/createEvent';

async function execute(interaction: Interaction, client: any) {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Comando ${interaction.commandName} não encontrado.`);
    return await interaction.reply({
      content: 'Comando não encontrado.',
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.log(error);
  }
}

createEvent(Events.InteractionCreate, execute);