import { Message } from "discord.js";

export default async function buildPrompt(message: Message, client: any) {
  const channel = {
    // @ts-ignore
    name: message.channel.name,
    type: message.channel.isVoiceBased() ? 'voice' : 'text',
    // @ts-ignore
    category: message.channel.parent?.name ?? null
  };

  const author = {
    name: message.member?.displayName,
    joinedAt: message.member?.joinedAt?.toISOString()
  };

  // Limpa menção ao bot
  let content = message.content.replace(`<@${client.user.id}>`, '').trim();

  // Substitui menções de outros usuários pelo displayName
  for (const user of message.mentions.users.values()) {
    if (user.id === client.user.id) continue;

    const mentionSyntax = `<@${user.id}>`;
    const escapedMention = mentionSyntax.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const mentionRegex = new RegExp(escapedMention, 'g');
    content = content.replace(mentionRegex, user.displayName);
  }

  const promptContext = {
    channel,
    author,
    content,
    timestamp: message.createdAt.toISOString()
  };

  // Captura a mensagem referenciada (se existir)
  if (message.reference?.messageId) {
    const ref = await message.channel.messages.fetch(message.reference.messageId);

    if (ref) {
      // @ts-ignore
      promptContext.referencedMessage = ref?.content;
    }
  }

  // Captura nomes mencionados (se houver)
  if (message.mentions.users.size > 0) {
    // @ts-ignore
    promptContext.mentionedUserNames = [...message.mentions.users.values()].map(user => {
      if (user.id !== client.user.id) {
        return user.displayName;
      }
    }).join(', ');
  }
  
  return JSON.stringify(promptContext);
}