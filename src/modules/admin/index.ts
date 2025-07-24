import { join as joinPath } from "path";
import { Client, Collection } from "discord.js";
import { loadCommands, loadEvents } from "../../shared/handlers";
import { Command } from "../../shared/types";

const adminModule = {
  name: 'admin',
  load: (client: Client<boolean> & { commands: Collection<string, Command> }) => {
    loadCommands(client, joinPath(__dirname, 'commands'));
    loadEvents(client, joinPath(__dirname, 'events'));
  }
}

export default adminModule;