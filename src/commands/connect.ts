import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { BotVoiceConnection } from '../bot/bot-voice-state';
import { Interaction } from 'discord.js';

export class ConnectBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('connect');
    this.setDescription('Connect to voice channel.');
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isRepliable() || !interaction.member || !interaction.guildId) return;

    if (!('voice' in interaction.member) || !interaction.member.voice.channelId) {
      await interaction.reply('Please connect to voice channel.');
      return;
    }

    if (!interaction.member.voice.channel?.guild.voiceAdapterCreator) {
      await interaction.reply('Cannot find voice adapter creator.');
      return;
    }

    if (getVoiceConnection(interaction.guildId)) {
      await interaction.reply('Already connected.');
      return;
    }

    const voiceConnection = await joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.member.voice.channel?.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    const botVoiceConnection = new BotVoiceConnection(bot, voiceConnection);
    bot.voiceConnections.set(interaction.guildId, botVoiceConnection);

    await interaction.reply('Connected.');
  }
}
