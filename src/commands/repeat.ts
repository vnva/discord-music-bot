import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { Interaction } from 'discord.js';

export class RepeatBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('repeat');
    this.setDescription('Toggle song repeat');
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isRepliable() || !interaction.isChatInputCommand() || !interaction.member || !interaction.guildId)
      return;

    let connection = bot.voiceConnections.get(interaction.guildId);

    if (!connection) {
      await interaction.reply('No active voice connection for bot');
      return;
    }

    connection.audioPlayer.toggleRepeat();

    await interaction.reply(`Repeat ${connection.audioPlayer.isRepeat ? 'enabled' : 'disabled'}`);
  }
}
