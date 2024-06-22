import { EmbedBuilder } from 'discord.js';
import playdl from 'play-dl';

const YOUTUBE_LOGO_PLACEHOLDER =
  'https://upload.wikimedia.org/wikipedia/commons/3/34/Logo_oficial_de_YouTube_%282013-2017%29.jpg';

export interface YoutubeVideoInfo {
  title: string;
  url: string;
  image: string;
  description: string;
  duration: number;
  channel: string;
}

export function normaliseYoutubeVideoUrl(url: string): string | null {
  if (url.startsWith('https://')) return url;
  if (url.startsWith('youtube.com')) return `https://${url}`;

  if (url.startsWith('http://')) {
    const urlObject = new URL(url);
    urlObject.protocol = 'https:';
    return urlObject.toString();
  }

  return null;
}

export async function findYoutubeVideo(
  target: string,
  limit = 5,
): Promise<YoutubeVideoInfo | YoutubeVideoInfo[] | null> {
  if (!target) return null;

  if (/youtube.com/i.test(target)) {
    const url = normaliseYoutubeVideoUrl(target);
    if (url === null) return null;
    let valid = false;

    try {
      const response = await playdl.video_basic_info(url);
      if (response) valid = true;

      return {
        url,
        title: response.video_details.title ?? 'Unknown',
        image: response.video_details.thumbnails.at(-1)?.url ?? YOUTUBE_LOGO_PLACEHOLDER,
        description: response.video_details.description ?? 'No info',
        duration: response.video_details.durationInSec,
        channel: response.video_details.channel?.name ?? 'Unknown',
      };
    } catch {
      return null;
    }
  }

  try {
    const searchResults = await playdl.search(target, { limit, fuzzy: true });
    if (searchResults.length === 0) return null;

    const mappedResults: YoutubeVideoInfo[] = searchResults.map((i) => ({
      url: i.url,
      title: i.title ?? 'Unknown',
      image: i.thumbnails.at(-1)?.url ?? YOUTUBE_LOGO_PLACEHOLDER,
      description: i.description ?? 'No info',
      duration: i.durationInSec,
      channel: i.channel?.name ?? 'Unknown',
    }));
    if (mappedResults.length === 1) return mappedResults[0];

    return mappedResults;
  } catch {
    return null;
  }
}

export function createYoutubeVideoInfoEmbed(youtubeVideoInfo: YoutubeVideoInfo) {
  const { title, description, url, image } = youtubeVideoInfo;

  return new EmbedBuilder().setTitle(title).setDescription(description).setURL(url).setImage(image);
}
