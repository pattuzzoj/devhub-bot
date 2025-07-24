import { Client, Collection, REST, Routes } from 'discord.js';
import type { Command } from '../types';
import { TOKEN, CLIENT_ID, GUILD_ID } from '../../config';

export function loadCommands(client: Client<boolean> & { commands: Collection<string, Command> }, path: string) {
  client.commands = new Collection();
  const commandsPath = path;

  try {
    const commands = require(commandsPath);

    for (const [name, command] of Object.entries(commands) as [string, Command][]) {
      if (!command?.data || typeof command.execute !== 'function') {
        console.warn(`Comando ${name} não possui estrutura válida`);
        continue;
      }

      client.commands.set(command.data.name, command);
      console.log(`Comando ${name} carregado`);
    }
  } catch (error) {
    console.error(`Erro ao carregar comandos:`, error);
  }

  const registerCommandsToAPI = async (commands: Collection<string, Command>) => {
    const rest = new REST().setToken(TOKEN);

    try {
      console.log(`Started refreshing ${commands.size} application (/) commands.`);

      const data = await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands.map(command => command.data.toJSON()) },
      );

      console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} application (/) commands.`);
    } catch (error) {
      console.error(error);
    }
  };

  registerCommandsToAPI(client.commands);
}