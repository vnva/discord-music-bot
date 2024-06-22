import { AudioPlayerStatus, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { Bot } from './bot';
import { BotPlayer } from './bot-player';
import { logger } from '../lib';

export class BotVoiceConnection {
  private readonly bot: Bot;
  readonly player: BotPlayer;

  readonly instance: VoiceConnection;

  constructor(bot: Bot, voiceConnection: VoiceConnection) {
    this.instance = voiceConnection;
    this.bot = bot;
    this.player = new BotPlayer(bot, this);

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

    this.player.disconnect();

    this.instance.disconnect();
    this.instance.removeAllListeners();

    logger.info(`Disconnected: ${this.instance.joinConfig.guildId}`);
  }
}
