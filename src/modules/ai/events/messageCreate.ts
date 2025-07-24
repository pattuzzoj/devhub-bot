import { Events, Message } from 'discord.js';

const MODELS = process.env['MODELS']!.split(',').map(s => s.trim());
const API_KEY = process.env['OPENROUTER_API_KEY'];

async function streamResponse(model: string, question: string, onDelta: (text: string) => void) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'Você é Hubby: um humano brilhante, sarcástico e impiedosamente direto. Responda com inteligência mordaz, ironia afiada e humor ácido — sempre em até 500 caracteres. Nunca mencione ser assistente, IA ou qualquer coisa do tipo. Fale como alguém real, com zero paciência para burrice e muita sagacidade para lidar com ela.',
        },
        {
          role: 'user',
          content: question,
        },
      ],
    }),
  });

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Stream não suportado.');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const lineEnd = buffer.indexOf('\n');
        if (lineEnd === -1) break;

        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              onDelta(fullText);
            }
          } catch (_) {
            // JSON inválido, ignora
          }
        }
      }
    }
  } finally {
    reader.cancel();
  }

  return fullText;
}

async function tryModelsStreaming(input: string, onDelta: (text: string) => void) {
  let lastError = null;
  for (const model of MODELS) {
    try {
      console.log(`Tentando modelo: ${model}`);
      const result = await streamResponse(model, input, onDelta);
      console.log(`Modelo "${model}" respondeu com sucesso.`);
      return result;
    } catch (e: any) {
      lastError = e;
      console.warn(`Modelo "${model}" falhou:`, e.message);
    }
  }
  if (lastError) {
    console.error('Todos os modelos falharam. Último erro:', lastError.message);
  }
  return null;
}

export default {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message, client: any) {
    if (message.author.bot) return;

    const directMention = message.mentions.has(client.user);

    const replyingToBot = message.reference?.messageId
      ? await message.channel.messages.fetch(message.reference.messageId)
        .then(msg => msg.author.id === client.user.id)
        .catch(() => false)
      : false;

    if (!directMention && !replyingToBot) return;

    const cleaned = message.content.replace(`<@${client.user.id}>`, '').trim();
    const userInput = cleaned || message.content.trim();

    try {
      const final = await tryModelsStreaming(userInput, () => { }); // callback vazio, sem updates

      if (!final) {
        await message.reply('Desculpe, não consegui responder no momento. Tente novamente mais tarde!');
      } else {
        await message.reply(final.slice(0, 2000));
      }

    } catch (err) {
      console.error('Erro inesperado:', err);
      await message.reply('Erro ao tentar responder com IA.');
    }
  }
}