import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { Interaction } from 'discord.js';

export class DisconnectBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('disconnect');
    this.setDescription('Disconnect from voice channel.');
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isRepliable() || !interaction.member || !interaction.guildId) return;

    const connection = bot.voiceConnections.get(interaction.guildId);

    if (connection) {
      connection.disconnect();
      await interaction.reply('Disconnected.');
      return;
    }

    await interaction.reply('Active connection not exists.');
  }
}
