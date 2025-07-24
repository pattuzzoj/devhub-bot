import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { Command } from './src/shared/types';
import { INTENTS, TOKEN } from './src/config';
import adminModule from "./src/modules/admin";
import aiModule from "./src/modules/ai";
import newsModule from "./src/modules/news";

const intents = INTENTS.map(intent => GatewayIntentBits[intent as keyof typeof GatewayIntentBits]);
const client = new Client({ intents }) as Client & { commands: Collection<string, Command> };

const modules = [adminModule, aiModule, newsModule];
modules.forEach(module => module.load(client));

client.login(TOKEN);
