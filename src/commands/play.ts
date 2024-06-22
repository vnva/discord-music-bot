import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction } from 'discord.js';
import { findYoutubeVideo, secondsToHms } from '../lib';
import { Bot } from '../bot';
import { BotCommand } from '../bot/bot-command';
import { BotVoiceConnection } from '../bot/bot-voice-state';
import { joinVoiceChannel } from '@discordjs/voice';

export class PlayBotCommand extends BotCommand {
  constructor() {
    super();

    this.setName('play');
    this.setDescription("Play a song or add to queue if it's already playing");
    this.addStringOption((o) =>
      o.setName('target').setDescription('Search query or link to youtube video').setRequired(true),
    );
  }

  async execute(interaction: Interaction, bot: Bot) {
    if (!interaction.isRepliable() || !interaction.isChatInputCommand() || !interaction.member || !interaction.guildId)
      return;

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
    const result = await findYoutubeVideo(target);

    if (!result) {
      await interaction.editReply("Can't find this target");
      return;
    }

    if (!Array.isArray(result)) {
      await connection.audioPlayer.add(interaction, result);
      return;
    }

    const embeds = result.map((i) =>
      new EmbedBuilder()
        .setTitle(i.title)
        .setDescription(i.description)
        .setThumbnail(i.image)
        .setURL(i.url)
        .setFields([
          { name: 'Channel', value: i.channel },
          { name: 'Duration', value: secondsToHms(i.duration) },
        ]),
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      result.map((_, index) =>
        new ButtonBuilder()
          .setCustomId(`${index}`)
          .setStyle(ButtonStyle.Primary)
          .setLabel(`${index + 1}`),
      ),
    );

    const response = await interaction.editReply({ content: 'Select song', embeds, components: [row] });

    try {
      const confirmation = await response.awaitMessageComponent({ time: 30_000 });
      const selectedResult = result[Number(confirmation.customId)];

      await confirmation.update({ content: 'Song selected', embeds: [], components: [] });
      await connection.audioPlayer.add(interaction, selectedResult);
    } catch {
      await interaction.deleteReply();
    }
  }
}
