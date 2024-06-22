import { ENV_VARIABLES, logger } from './lib';
import { Bot } from './bot';

async function main() {
  try {
    const bot = new Bot();
    await bot.login(ENV_VARIABLES.BOT_TOKEN);
  } catch (error) {
    logger.error(`Can't start bot!`, error);
    process.exit(1);
  }
}

main();
