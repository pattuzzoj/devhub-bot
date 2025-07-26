import { Message, TextChannel } from "discord.js";
import { directMentionPrompt, replyToIAPrompt, replyToOtherUserPrompt } from "./prompts";

function escapeMention(content: string, id: string, username: string) {
  const mentionSyntax = `<@${id}>`;
  const escapedMention = mentionSyntax.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const mentionRegex = new RegExp(escapedMention, 'g');
  content = content.replace(mentionRegex, username);
  return content;
}

export default async function buildPrompt(message: Message, client: any) {
  const channel = message.channel as TextChannel;

  const prompt = {
    system: directMentionPrompt,
    data: {
      channel: {
        category: channel.parent?.name ?? '',
        name: channel.name
      },
      user: {}
    }
  }

  const user = {
    name: message.member?.displayName,
    message: message.content
  };

  // Limpa menção ao bot
  user.message = message.content.replace(`<@${client.user.id}>`, '').trim();

  // Substitui menções de outros usuários pelo displayName
  for (const userMention of message.mentions.users.values()) {
    user.message = escapeMention(user.message, userMention.id, userMention.displayName);
  }

  prompt.data.user = user;

  // Captura a mensagem referenciada (se existir)
  if (message.reference?.messageId) {
    const ref = await message.channel.messages.fetch(message.reference.messageId);

    if (ref) {
      let content = ref?.content;
      // Substitui menções de outros usuários pelo displayName
      for (const user of ref.mentions.users.values()) {
        content = escapeMention(content, user.id, user.displayName);
      }

      if (ref.author.id === client.user.id) {
        prompt.system = replyToIAPrompt;
      } else {
        prompt.system = replyToOtherUserPrompt;
      }

      // @ts-ignore
      prompt.data.referencedMessage = {
        author: ref?.author?.displayName,
          content: content
      }
    }
  }
  
  return prompt;
}