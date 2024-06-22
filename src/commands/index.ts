import { BotCommand } from '../bot/bot-command';
import { ConnectBotCommand } from './connect';
import { DisconnectBotCommand } from './disconnect';
import { PauseBotCommand } from './pause';
import { PingBotCommand } from './ping';
import { PlayBotCommand } from './play';
import { SkipBotCommand } from './skip';
import { UnpauseBotCommand } from './unpause';

export const BOT_COMMANDS: Map<string, BotCommand> = new Map([
  new PingBotCommand().nameCommandPair,
  new ConnectBotCommand().nameCommandPair,
  new DisconnectBotCommand().nameCommandPair,
  new PlayBotCommand().nameCommandPair,
  new PauseBotCommand().nameCommandPair,
  new UnpauseBotCommand().nameCommandPair,
  new SkipBotCommand().nameCommandPair,
]);
