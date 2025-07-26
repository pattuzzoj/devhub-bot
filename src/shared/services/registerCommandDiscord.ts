import { Collection, REST, Routes } from "discord.js";
import { Command } from "../types";

export default async function (commands: Collection<string, Command>) {
  const rest = new REST().setToken(process.env['DISCORD_TOKEN']!);

  try {
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env['CLIENT_ID']!, process.env['GUILD_ID']!),
      { body: commands.map(command => command.data.toJSON()) },
    );

    console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
}