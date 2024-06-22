import { VoiceConnection, createAudioResource } from '@discordjs/voice';
// @ts-ignore
import gTTS from 'gtts';

export const VOICEOVER_TEXTS = {
  queueIsEmpty: 'Очередь пуста',
  queueIsFull: 'Очередь переполнена',
  startPlaying: 'Включаю',
  addedToQueue: 'Добавил в очередь',
  nextTrack: 'Идем дальше',
  pausePlaying: 'Поставил на паузу',
  unpausePlaying: 'Продолжаем',
  turnOff: 'Выключил',
  disconnect: 'Пока',
  waiting: 'Слушаю',
  dontUnderstand: 'Я вас не понял',
  noResults: 'Ничего не нашлось',
};

const LANG = 'ru-RU';
const KEY = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';
const PROFANITY_FILTER = '0';

export async function speechToText(monoBuffer: Buffer): Promise<null | string[]> {
  try {
    const response = await fetch(
      `https://www.google.com/speech-api/v2/recognize?output=json&lang=${LANG}&key=${KEY}&pFilter=${PROFANITY_FILTER}`,
      {
        method: 'POST',
        body: monoBuffer,
        headers: {
          'Content-Type': 'audio/l16; rate=48000;',
        },
      },
    );

    if (!response.ok) throw new Error('Google speech api error');

    const text = await response.text();

    const json = JSON.parse(text.replace('{"result":[]}', ''));
    if (!('result' in json) || !Array.isArray(json.result) || json.result.lenght < 1) return null;

    return json.result[0].alternative.map((obj: any) => obj.transcript);
  } catch {
    return null;
  }
}

export function sayToConnection(connection: VoiceConnection, text: string): Promise<boolean> {
  return new Promise((resolve) => {
    const clearText = text.replace(/-/g, '').replace(/\|/g, '').replace(/\s+/g, ' ').toLowerCase().trim();
    const gtts = new gTTS(clearText, 'ru');
    const resource = createAudioResource(gtts.stream());

    resource.playStream.on('data', (chunk) => {
      connection.playOpusPacket(chunk);
    });

    resource.playStream.on('end', () => {
      resolve(true);
    });

    resource.playStream.on('error', () => {
      resolve(false);
    });
  });
}
