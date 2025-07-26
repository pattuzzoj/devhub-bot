import { Events, Message } from 'discord.js';
import buildPrompt from '../util/buildPrompt';
import fetchStreamResponse from '../services/streamPromptResponse';
import { createEvent } from '../../../shared/handlers/createEvent';

async function execute(message: Message, client: any) {
  if (message.author.bot) return;

  const directMention = message.mentions.has(client.user);
  if (!directMention) return;

  const prompt = await buildPrompt(message, client);

  try {
    const result = await fetchStreamResponse(prompt);

    if (!result) {
      await message.reply('Desculpe, não consegui responder no momento. Tente novamente mais tarde!');
    } else {
      await message.reply(result.slice(0, 2000));
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
    await message.reply('Erro ao tentar responder com IA.');
  }
}

createEvent(Events.MessageCreate, execute);