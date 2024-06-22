import {
  ENV_VARIABLES,
  VOICEOVER_TEXTS,
  convertStereoToMono,
  findYoutubeVideo,
  getDurationFromMonoBuffer,
  logger,
  sayToConnection,
  speechToText,
} from '../lib';
import { Bot } from './bot';
import { BotPlayer } from './bot-player';
import { BotVoiceConnection } from './bot-voice-state';
import { EndBehaviorType } from '@discordjs/voice';
import { OpusDecoder } from 'audify';

enum VoiceCommand {
  play,
  pause,
  unpause,
  stop,
  disconnect,
  skip,
}

const VOICE_COMMAND_REGEXP_MAP: Record<VoiceCommand, RegExp> = {
  [VoiceCommand.play]: /вкл/i,
  [VoiceCommand.pause]: /пауз/i,
  [VoiceCommand.unpause]: /продолж/i,
  [VoiceCommand.stop]: /хват/i,
  [VoiceCommand.disconnect]: /отключ/i,
  [VoiceCommand.skip]: /дальш/i,
};

const VOICE_COMMAND_REGEXP = Object.values(VOICE_COMMAND_REGEXP_MAP);

const KEY_WORD_REGEXP = new RegExp(ENV_VARIABLES.VOICE_CONTROL_KEY_WORD, 'i');

const decoder = new OpusDecoder(48000, 2);

export class BotPlayerVoiceControl {
  private readonly bot: Bot;
  private readonly connection: BotVoiceConnection;
  private readonly player: BotPlayer;
  private waitCommand = false;

  constructor(bot: Bot, connection: BotVoiceConnection, player: BotPlayer) {
    this.bot = bot;
    this.connection = connection;
    this.player = player;

    this.initialise();
  }

  private initialise() {
    this.connection.instance.receiver.speaking.on('start', (userId) => {
      const opusStream = this.connection.instance.receiver.subscribe(userId, {
        end: { behavior: EndBehaviorType.AfterSilence, duration: 300 },
      });

      const chunksBuffers: Buffer[] = [];

      opusStream.on('data', (chunk) => {
        try {
          const chunkBuffer = decoder.decode(chunk, 960);
          chunksBuffers.push(chunkBuffer);
        } catch {}
      });

      opusStream.on('end', async () => {
        const sterioBuffer = Buffer.concat(chunksBuffers);
        const monoBuffer = convertStereoToMono(sterioBuffer);
        const duration = getDurationFromMonoBuffer(monoBuffer);

        if (duration < 1 || duration > 10) return;

        const alternatives = await speechToText(monoBuffer);
        logger.debug(`Speech to text "${alternatives?.join(' | ')}"`);
        if (!alternatives) return;

        this.processRecongnised(alternatives);
      });
    });
  }

  private async processRecongnised(alternatives: string[]) {
    const hasKeyWord = alternatives.some((s) => KEY_WORD_REGEXP.test(s));
    const alternativesWithoutKeyWord = alternatives.map((s) => s.replace(KEY_WORD_REGEXP, '').trim());
    const hasCommand = alternativesWithoutKeyWord.some((s) => VOICE_COMMAND_REGEXP.some((r) => r.test(s)));

    if (hasKeyWord && !hasCommand) {
      this.player.pause();
      await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.waiting);
      this.waitCommand = true;
    }

    if ((this.waitCommand || hasKeyWord) && hasCommand) {
      if (alternativesWithoutKeyWord.some((s) => VOICE_COMMAND_REGEXP_MAP[VoiceCommand.play].test(s))) {
        const search = alternativesWithoutKeyWord[0].replace(VOICE_COMMAND_REGEXP[VoiceCommand.play], '').trim();
        await this.commandPlay(search);
      } else if (alternativesWithoutKeyWord.some((s) => VOICE_COMMAND_REGEXP_MAP[VoiceCommand.pause].test(s))) {
        await this.commandPause();
      } else if (alternativesWithoutKeyWord.some((s) => VOICE_COMMAND_REGEXP_MAP[VoiceCommand.unpause].test(s))) {
        await this.commandUnpause();
      } else if (alternativesWithoutKeyWord.some((s) => VOICE_COMMAND_REGEXP_MAP[VoiceCommand.stop].test(s))) {
        await this.commandStop();
      } else if (alternativesWithoutKeyWord.some((s) => VOICE_COMMAND_REGEXP_MAP[VoiceCommand.disconnect].test(s))) {
        await this.commandDisconnect();
      } else if (alternativesWithoutKeyWord.some((s) => VOICE_COMMAND_REGEXP_MAP[VoiceCommand.skip].test(s))) {
        await this.commandSkip();
      } else if (!hasKeyWord) {
        await this.player.unpause();
      }

      if (!hasKeyWord) this.waitCommand = false;
    } else if (this.waitCommand && !hasKeyWord) {
      await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.dontUnderstand);
      this.waitCommand = false;
      this.player.unpause();
    }
  }

  private async commandPlay(search: string) {
    const result = await findYoutubeVideo(search, 1);

    if (!result || Array.isArray(result)) {
      this.player.pause();
      await sayToConnection(this.connection.instance, VOICEOVER_TEXTS.noResults);
      return;
    }

    await this.player.add(null, result);
  }

  private async commandPause() {
    await this.player.pause(true);
  }

  private async commandUnpause() {
    await this.player.unpause(true);
  }

  private async commandStop() {
    await this.player.stop();
  }

  private async commandDisconnect() {
    await this.connection.disconnect();
  }

  private async commandSkip() {
    await this.player.skip();
  }
}
