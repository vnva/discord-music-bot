import { ENV_VARIABLES, logger } from './lib';
import { REST, Routes } from 'discord.js';
import { BOT_COMMANDS } from './commands';

const { BOT_TOKEN, TEST_GUILD_ID, BOT_APPLICATION_ID } = ENV_VARIABLES;

async function main() {
  try {
    const rest = new REST().setToken(BOT_TOKEN);
    const body = Array.from(BOT_COMMANDS.values()).map((c) => c.toJSON());

    await rest.put(Routes.applicationCommands(BOT_APPLICATION_ID), { body });

    if (TEST_GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(BOT_APPLICATION_ID, TEST_GUILD_ID), { body });
    }

    logger.info(`Successfully deployed bot commands.`);
    process.exit(0);
  } catch (error) {
    logger.error(`Can't deploy bot commands!`, error);
    process.exit(1);
  }
}

main();
