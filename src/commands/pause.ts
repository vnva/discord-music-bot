import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { Interaction } from 'discord.js';

export class PauseBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('pause');
    this.setDescription('Pause song.');
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isRepliable() || !interaction.isChatInputCommand() || !interaction.member || !interaction.guildId)
      return;

    let connection = bot.voiceConnections.get(interaction.guildId);

    if (!connection) {
      await interaction.reply('Bot not have active connection.');
      return;
    }

    if (connection.player.isPaused) {
      await interaction.reply('Already paused.');
      return;
    }

    await connection.player.pause(true);

    await interaction.reply(`Paused.`);
  }
}
