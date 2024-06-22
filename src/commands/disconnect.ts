import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { Interaction } from 'discord.js';

export class DisconnectBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('disconnect');
    this.setDescription('Disconnect bot from voice chat');
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isRepliable() || !interaction.member || !interaction.guildId) return;

    const connection = bot.voiceConnections.get(interaction.guildId);

    if (connection) {
      connection.disconnect();
      await interaction.reply('Bot disconnected from voice chat');
      return;
    }

    await interaction.reply('No active voice connection for bot');
  }
}
