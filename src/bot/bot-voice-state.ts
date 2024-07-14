import { VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { clearPresence, logger } from '../lib';
import { Bot } from './bot';
import { BotAudioPlayer } from './bot-audio-player';

export class BotVoiceConnection {
  private readonly bot: Bot;
  readonly audioPlayer: BotAudioPlayer;

  readonly instance: VoiceConnection;

  constructor(bot: Bot, voiceConnection: VoiceConnection) {
    this.instance = voiceConnection;
    this.bot = bot;
    this.audioPlayer = new BotAudioPlayer(bot, this);

    this.initialise();

    logger.info(`New voice connection: ${voiceConnection.joinConfig.guildId}`);
  }

  private initialise() {
    this.instance.on(VoiceConnectionStatus.Destroyed, () => {
      this.disconnect();
    });

    this.instance.on('error', () => {
      this.disconnect();
    });
  }

  disconnect() {
    this.bot.voiceConnections.delete(this.instance.joinConfig.guildId);

    this.audioPlayer.stop();

    this.instance.disconnect();
    this.instance.destroy();

    logger.info(`Disconnected: ${this.instance.joinConfig.guildId}`);
    clearPresence(this.bot);
  }
}
