import { AudioPlayerStatus, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import { VOICEOVER_TEXTS, YoutubeVideoInfo, createYoutubeVideoInfoEmbed, sayToConnection } from '../lib';
import { Bot } from './bot';
import { BotPlayerVoiceControl } from './bot-player-voice-control';
import { BotVoiceConnection } from './bot-voice-state';
import { CommandInteraction } from 'discord.js';
import ytdl from 'ytdl-core';

const SILENT_BOT_PLAYER_STATUSES = [AudioPlayerStatus.Idle, AudioPlayerStatus.AutoPaused, AudioPlayerStatus.Paused];

export class BotPlayer {
  private readonly instance = createAudioPlayer();
  private readonly bot: Bot;
  private readonly connection: BotVoiceConnection;
  private readonly voiceControl: BotPlayerVoiceControl;
  private queue: YoutubeVideoInfo[] = [];
  private lastInteraction: CommandInteraction | null = null;

  constructor(bot: Bot, connection: BotVoiceConnection) {
    this.bot = bot;
    this.connection = connection;
    this.voiceControl = new BotPlayerVoiceControl(bot, connection, this);

    this.initialise();
  }

  private initialise() {
    this.connection.instance.subscribe(this.instance);

    this.instance.on(AudioPlayerStatus.Idle, async () => {
      await this.next();
    });
  }

  private async createResource(link: string) {
    const stream = await ytdl(link, {
      filter: 'audioonly',
      highWaterMark: 1 << 62,
      liveBuffer: 1 << 62,
      dlChunkSize: 0,
      quality: 'lowestaudio',
    });
    return createAudioResource(stream);
  }

  get isQueueEmpty() {
    return this.queue.length === 0;
  }

  get isPaused() {
    return this.instance.state.status === AudioPlayerStatus.Paused;
  }

  async next() {
    const item = this.queue[0];

    if (!item) {
      this.stop();
      await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.queueIsEmpty);
      await this.lastInteraction?.editReply({ content: 'Queue is empty!', embeds: [] });
      return;
    }

    const resource = await this.createResource(item.url);
    this.instance.play(resource);
    await this.lastInteraction?.editReply({ content: `Now played.`, embeds: [createYoutubeVideoInfoEmbed(item)] });
    this.queue.shift();
  }

  async add(interaction: CommandInteraction | null, youtubeVideoInfo: YoutubeVideoInfo) {
    this.lastInteraction = interaction;

    if (this.queue.length === 30) {
      await interaction?.reply('Queue is full.');
      await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.queueIsFull);
      return;
    }

    this.queue.push(youtubeVideoInfo);

    if (SILENT_BOT_PLAYER_STATUSES.includes(this.instance.state.status) && this.queue.length === 1) {
      await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.startPlaying);
      await this.next();
    } else {
      await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.addedToQueue);
      await interaction?.editReply({
        content: 'Added to queue.',
        embeds: [createYoutubeVideoInfoEmbed(youtubeVideoInfo)],
      });
    }
  }

  async skip(interaction?: CommandInteraction) {
    if (interaction) this.lastInteraction = interaction;
    if (this.queue.length !== 0) await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.nextTrack);
    await this.next();
  }

  async pause(voice = false) {
    this.instance.pause();
    if (voice) await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.pausePlaying);
  }

  async unpause(voice = false) {
    if (voice) await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.unpausePlaying);
    this.instance.unpause();
  }

  async stop() {
    this.instance.stop();
    this.queue = [];
    await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.turnOff);
  }

  async disconnect() {
    await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.disconnect);

    setTimeout(() => {
      this.queue = [];
      this.instance.stop();
      this.instance.removeAllListeners();
    }, 3_000);
  }
}
