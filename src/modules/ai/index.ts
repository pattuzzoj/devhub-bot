import { join as joinPath } from "path";
import { Client } from "discord.js";
import { loadEvents } from "../../shared/handlers";

const aiModule = {
  name: 'ai',
  load: (client: Client<boolean>) => {
    loadEvents(client, joinPath(__dirname, 'events'));
  }
}

export default aiModule;