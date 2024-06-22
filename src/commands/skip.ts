import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { Interaction } from 'discord.js';

export class SkipBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('skip');
    this.setDescription('Skip song.');
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isRepliable() || !interaction.isChatInputCommand() || !interaction.member || !interaction.guildId)
      return;

    await interaction.deferReply({ ephemeral: true });

    let connection = bot.voiceConnections.get(interaction.guildId);

    if (!connection) {
      await interaction.reply('No active voice connection for bot');
      return;
    }

    await connection.audioPlayer.skip(interaction);
  }
}
