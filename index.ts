import 'dotenv/config';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import newsModule from "./src/modules/news";
import { commands } from './src/shared/handlers/createCommand';
import registerCommandDiscord from './src/shared/services/registerCommandDiscord';
import { loadEvents } from './src/shared/handlers/createEvent';
import "./src/modules/translate";
import './src/modules/admin';
import "./src/modules/ai";
import "./src/shared/events";
import type { Command } from './src/shared/types';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as Client & { commands: Collection<string, Command> };

newsModule.init(client);

const modules = [newsModule];
modules.forEach(module => module.init(client));

// @ts-ignore
client.commands = commands;
registerCommandDiscord(client.commands);
loadEvents(client);

client.once(Events.ClientReady, (readyClient: Client<true>) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
})

client.login(process.env['DISCORD_TOKEN']);
