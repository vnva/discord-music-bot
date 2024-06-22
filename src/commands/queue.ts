import { EmbedBuilder, Interaction } from 'discord.js';
import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { secondsToHms } from '../lib';

const CURRENT_SONG_TITLE = `🎶 **Now played**`;
const NEXT_SONGS_TITLE = `📻 **Next songs**`;

export class QueueBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('queue');
    this.setDescription('Display list of songs in queue');
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.member || !interaction.guildId) return;

    let connection = bot.voiceConnections.get(interaction.guildId);

    if (!connection) {
      await interaction.reply('No active voice connection for bot');
      return;
    }

    const { queue, isQueueEmpty, current: currentQueueItem } = connection.audioPlayer;

    if (isQueueEmpty) {
      await interaction.reply('There are no songs in the queue');
      return;
    }

    const nextSongsItems = queue
      .map((item, index) => `${index + 1}. [${secondsToHms(item.duration, true)}] [${item.title}](${item.url})`)
      .join('\n');

    let description = `
      ${NEXT_SONGS_TITLE}\n
      ${nextSongsItems}
    `;

    if (currentQueueItem) {
      const currentSongItem = `[${secondsToHms(currentQueueItem.duration, true)}] [${currentQueueItem.title}](${currentQueueItem.url})`;

      description = `
        ${CURRENT_SONG_TITLE}\n
        ${currentSongItem}\n\n
        ${description}
      `;
    }

    const queueListEmbed = new EmbedBuilder().setTitle('List of songs in queue').setDescription(description);

    await interaction.reply({ embeds: [queueListEmbed] });
  }
}
