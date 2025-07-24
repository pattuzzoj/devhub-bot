import { Client } from 'discord.js';

export interface EventModule {
  name: string;
  once: boolean;
  execute: (...args: any[]) => void | Promise<void>;
}

export function loadEvents(client: Client, path: string) {
  const eventsPath = path;

  try {
    const events = require(eventsPath);

    for (const [name, event] of Object.entries(events) as [string, EventModule][]) {
      if (!event.name || typeof event.execute !== 'function') {
        console.warn(`Evento ${name} não possui estrutura válida`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(`Evento ${event.name} carregado`);
    }

  } catch (error) {
    console.error(`Erro ao carregar eventos:`, error);
  }
}