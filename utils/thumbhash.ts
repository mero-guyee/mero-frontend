import { AlphaType, ColorType, Skia, rect } from '@shopify/react-native-skia';
import { rgbaToThumbHash } from 'thumbhash';

const MAX_DIMENSION = 100;
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    result += BASE64_CHARS[b0 >> 2];
    result += BASE64_CHARS[((b0 & 0x03) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    result +=
      b1 === undefined ? '=' : BASE64_CHARS[((b1 & 0x0f) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    result += b2 === undefined ? '=' : BASE64_CHARS[b2 & 0x3f];
  }
  return result;
}

export function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://');
}

export async function computeThumbhash(uri: string): Promise<string | null> {
  try {
    const data = await Skia.Data.fromURI(uri);
    const image = Skia.Image.MakeImageFromEncoded(data);
    if (!image) return null;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width(), image.height()));
    const width = Math.max(1, Math.round(image.width() * scale));
    const height = Math.max(1, Math.round(image.height() * scale));

    const surface = Skia.Surface.Make(width, height);
    if (!surface) return null;

    surface
      .getCanvas()
      .drawImageRect(
        image,
        rect(0, 0, image.width(), image.height()),
        rect(0, 0, width, height),
        Skia.Paint()
      );

    const pixels = surface.makeImageSnapshot().readPixels(0, 0, {
      width,
      height,
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Unpremul,
    }) as Uint8Array | null;
    if (!pixels) return null;

    return bytesToBase64(rgbaToThumbHash(width, height, pixels));
  } catch {
    return null;
  }
}

export async function resolveThumbhash(
  imageUrl?: string,
  fallback?: string
): Promise<string | undefined> {
  if (!imageUrl || !isLocalUri(imageUrl)) return fallback;
  return (await computeThumbhash(imageUrl)) ?? fallback;
}
