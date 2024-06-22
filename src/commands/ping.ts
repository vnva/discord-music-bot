import { BotCommand } from '../bot/bot-command';
import { Interaction } from 'discord.js';

export class PingBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('ping');
    this.setDescription('Health check command.');
  }

  async execute(interaction: Interaction) {
    if (!interaction.isRepliable()) return;
    interaction.reply('Pong!');
  }
}
