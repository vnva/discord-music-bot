import { ActivityType, CommandInteraction } from 'discord.js';
import { AudioPlayerStatus, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import {
  ENV_VARIABLES,
  YoutubeVideoInfo,
  clearPresence,
  createYoutubeVideoInfoEmbed,
  setYoutubePresence,
} from '../lib';
import { Bot } from './bot';
import { BotVoiceConnection } from './bot-voice-state';
import ytdl from '@distube/ytdl-core';

export class BotAudioPlayer {
  private readonly instance = createAudioPlayer();
  private readonly bot: Bot;
  private readonly connection: BotVoiceConnection;
  private lastInteraction: CommandInteraction | null = null;

  queue: YoutubeVideoInfo[] = [];
  current: YoutubeVideoInfo | null = null;
  isRepeat = false;

  constructor(bot: Bot, connection: BotVoiceConnection) {
    this.bot = bot;
    this.connection = connection;

    this.initialise();
  }

  private initialise() {
    this.connection.instance.subscribe(this.instance);

    this.instance.on(AudioPlayerStatus.Idle, async () => {
      await this.next(true);
    });
  }

  private async createResource(link: string) {
    const stream = await ytdl(link, {
      filter: 'audioonly',
      highWaterMark: 1 << 62,
      liveBuffer: 1 << 62,
      dlChunkSize: 0,
      quality: 'highestaudio',
    });
    return createAudioResource(stream);
  }

  get isQueueEmpty() {
    return this.queue.length === 0;
  }

  get isPaused() {
    return this.instance.state.status === AudioPlayerStatus.Paused;
  }

  async next(ended = false) {
    const item = ended && this.isRepeat ? this.current : this.queue[0];

    if (!item) {
      this.stop();
      this.current = null;
      await this.lastInteraction?.editReply({ content: 'There are no songs in the queue', embeds: [] });
      return;
    }

    const resource = await this.createResource(item.url);
    this.instance.play(resource);

    setYoutubePresence(this.bot, item);

    if (!(ended && this.isRepeat)) {
      this.current = item;
      await this.lastInteraction?.editReply({ content: `Now played`, embeds: [createYoutubeVideoInfoEmbed(item)] });
      this.queue.shift();
    }
  }

  async add(interaction: CommandInteraction | null, youtubeVideoInfo: YoutubeVideoInfo) {
    this.lastInteraction = interaction;

    if (this.queue.length === 20) {
      await interaction?.reply('The queue is full');
      return;
    }

    this.queue.push(youtubeVideoInfo);

    if (this.current === null) {
      await this.next();
    } else {
      await interaction?.editReply({
        content: 'Added to queue',
        embeds: [createYoutubeVideoInfoEmbed(youtubeVideoInfo)],
      });
    }
  }

  async skip(interaction?: CommandInteraction) {
    if (interaction) this.lastInteraction = interaction;
    await this.next();
  }

  pause() {
    this.instance.pause();
    clearPresence(this.bot);
  }

  unPause() {
    this.instance.unpause();
    if (this.current) setYoutubePresence(this.bot, this.current);
  }

  togglePause() {
    this.isPaused ? this.unPause() : this.pause();
  }

  toggleRepeat() {
    this.isRepeat = !this.isRepeat;
  }

  stop() {
    this.instance.stop();
    this.queue = [];
    this.current = null;
    clearPresence(this.bot);
  }

  disconnect() {
    this.queue = [];
    this.instance.stop();
    this.instance.removeAllListeners();
  }
}
