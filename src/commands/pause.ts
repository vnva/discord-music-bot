import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { Interaction } from 'discord.js';

export class PauseBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('pause');
    this.setDescription('Toggle playback pause');
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isRepliable() || !interaction.isChatInputCommand() || !interaction.member || !interaction.guildId)
      return;

    let connection = bot.voiceConnections.get(interaction.guildId);

    if (!connection) {
      await interaction.reply('No active voice connection for bot');
      return;
    }

    connection.audioPlayer.togglePause();

    await interaction.reply(`Playback ${connection.audioPlayer.isPaused ? 'paused' : 'unpaused'}`);
  }
}
