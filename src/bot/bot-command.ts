import { Interaction, SlashCommandBuilder } from 'discord.js';
import { Bot } from './bot';

export abstract class BotCommand extends SlashCommandBuilder {
  abstract execute(interaction: Interaction, bot: Bot): Promise<void>;

  get nameCommandPair(): [string, BotCommand] {
    return [this.name, this];
  }
}
