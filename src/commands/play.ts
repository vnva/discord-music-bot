import { AutocompleteInteraction, Interaction } from 'discord.js';
import { findYoutubeVideo, mapPlaydlInfoData, secondsToHms } from '../lib';
import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { BotVoiceConnection } from '../bot/bot-voice-state';
import { joinVoiceChannel } from '@discordjs/voice';
import playdl from 'play-dl';

export class PlayBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('play');
    this.setDescription(`Play a song or add to queue if it's already playing`);
    this.addStringOption((o) =>
      o
        .setName('target')
        .setDescription('Search query or link to youtube video')
        .setAutocomplete(true)
        .setRequired(true),
    );
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (interaction.isAutocomplete()) {
      await this.autocomplete(interaction);
      return;
    }

    if (!interaction.isChatInputCommand() || !interaction.member || !interaction.guildId) return;

    await interaction.deferReply({ ephemeral: true });

    let connection = bot.voiceConnections.get(interaction.guildId);

    if (!connection) {
      if (!('voice' in interaction.member) || !interaction.member.voice.channelId) {
        await interaction.editReply('Please first connect to the desired voice chat yourself');
        return;
      }

      if (!interaction.member.voice.channel?.guild.voiceAdapterCreator) {
        await interaction.editReply("Can't find voice adapter creator");
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

      connection = botVoiceConnection;
    }

    const target = interaction.options.getString('target', true);
    const info = await playdl.video_basic_info(target);

    if (!info) {
      await interaction.editReply('Could not find this song');
      return;
    }

    await connection.audioPlayer.add(interaction, mapPlaydlInfoData(info));
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const target = interaction.options.getFocused();

    if (!target) {
      await interaction.respond([]);
      return;
    }

    const videos = await findYoutubeVideo(target, 20);

    if (!videos) {
      await interaction.respond([]);
      return;
    }

    await interaction.respond(
      videos.map((v) => {
        let name = `[${secondsToHms(v.duration, true)}] ${v.title}`;

        if (name.length >= 100) {
          name = name.slice(0, 100);
        }

        return { name: name, value: v.url };
      }),
    );
  }
}
