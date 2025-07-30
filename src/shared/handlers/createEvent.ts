import { Client } from "discord.js";

export const events = new Map();

export function createEvent(name: string, execute: (...args: any[]) => void) {
  if (events.has(name)) {
    const event = events.get(name);
    event.handlers.push(execute);
    events.set(name, event);
  } else {
    events.set(name, {
      name: name,
      handlers: [execute],
    });
  }
}

export function loadEvents(client: Client) {
  events.forEach((event, name) => {
    client.on(name, async (...args) => {
      for (const handler of event.handlers) {
        await handler(...args, client);
      }
    })
    console.log(`Evento ${name} carregado`);
  })
}