import { BotCommand } from '../bot/bot-command';
import { ConnectBotCommand } from './connect';
import { DisconnectBotCommand } from './disconnect';
import { PauseBotCommand } from './pause';
import { PingBotCommand } from './ping';
import { PlayBotCommand } from './play';
import { QueueBotCommand } from './queue';
import { RepeatBotCommand } from './repeat';
import { SkipBotCommand } from './skip';

export const BOT_COMMANDS: Map<string, BotCommand> = new Map([
  new PingBotCommand().nameCommandPair,
  new ConnectBotCommand().nameCommandPair,
  new DisconnectBotCommand().nameCommandPair,
  new PlayBotCommand().nameCommandPair,
  new PauseBotCommand().nameCommandPair,
  new SkipBotCommand().nameCommandPair,
  new QueueBotCommand().nameCommandPair,
  new RepeatBotCommand().nameCommandPair,
]);
