import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { Interaction } from 'discord.js';

export class UnpauseBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('unpause');
    this.setDescription('Unpause song.');
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isRepliable() || !interaction.isChatInputCommand() || !interaction.member || !interaction.guildId)
      return;

    let connection = bot.voiceConnections.get(interaction.guildId);

    if (!connection) {
      await interaction.reply('Bot not have active connection.');
      return;
    }

    if (!connection.player.isPaused) {
      await interaction.reply('Already unpaused.');
      return;
    }

    await connection.player.unpause(true);

    await interaction.reply(`Unpaused.`);
  }
}
