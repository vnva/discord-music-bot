import { ActivityType, Client, PresenceUpdateStatus } from 'discord.js';
import { ENV_VARIABLES } from './env-variables';
import { YoutubeVideoInfo } from './youtube';

export async function setYoutubePresence(client: Client, video: YoutubeVideoInfo) {
  if (!ENV_VARIABLES.ENABLE_PRESENCE) return;

  try {
    const { title, url, image } = video;

    client.user?.setActivity({
      name: `${title}`,
      type: ActivityType.Listening,
      url: url,
    });
    client.user?.setStatus('online');

    await client.user?.setBanner(image);
  } catch (error) {}
}

export async function clearPresence(client: Client) {
  if (!ENV_VARIABLES.ENABLE_PRESENCE) return;

  try {
    client.user?.setActivity();
    client.user?.setStatus('idle');
    await client.user?.setBanner(null);
  } catch {}
}
