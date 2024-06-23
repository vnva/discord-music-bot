import { Client, ClientOptions, Events, GatewayIntentBits } from 'discord.js';
import { BOT_COMMANDS } from '../commands';
import { BotVoiceConnection } from './bot-voice-state';
import { logger } from '../lib';

const BOT_CLIENT_OPTIONS: ClientOptions = {
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages],
};

export class Bot extends Client {
  readonly voiceConnections: Map<string, BotVoiceConnection> = new Map();

  constructor() {
    super(BOT_CLIENT_OPTIONS);
    this.initialize();
  }

  private initialize() {
    this.on(Events.ClientReady, async (event) => {
      logger.info(`Bot logged in as ${this.user?.tag}`);
    });

    this.registerSlashCommands();
  }

  private registerSlashCommands() {
    this.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

      const command = BOT_COMMANDS.get(interaction.commandName);

      if (!command) {
        logger.error(`Not found "${interaction.commandName}" command`);
        return;
      }

      try {
        await command.execute(interaction, this);
      } catch (error) {
        logger.error(`Can't execite ${interaction.commandName} command`, error);

        if (!interaction.isRepliable()) return;

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      }
    });
  }
}
