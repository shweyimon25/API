import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const AVATAR_EXTENSIONS = /\.(png|jpe?g|webp|gif)$/i;
const AVATARS_DIR = join(process.cwd(), "public/avatars");
const AVATARS_PUBLIC_PREFIX = "/public/avatars";

const getAvatarFilenames = () => {
  if (!existsSync(AVATARS_DIR)) {
    return [];
  }

  return readdirSync(AVATARS_DIR)
    .filter((file) => AVATAR_EXTENSIONS.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

/** Returns a packaged avatar path that can be stored directly on a user. */
export const getRandomAvatarPath = (): string | undefined => {
  const avatars = getAvatarFilenames();
  if (!avatars.length) {
    return undefined;
  }

  const filename = avatars[Math.floor(Math.random() * avatars.length)];
  return `${AVATARS_PUBLIC_PREFIX}/${encodeURIComponent(filename)}`;
};

class AvatarService {
  async findAll(baseUrl: string) {
    const origin = baseUrl.replace(/\/$/, "");
    const files = getAvatarFilenames();

    return files.map((filename) => {
      const absolutePath = join(AVATARS_DIR, filename);
      const stats = statSync(absolutePath);
      const path = `${AVATARS_PUBLIC_PREFIX}/${encodeURIComponent(filename)}`;

      return {
        name: filename,
        url: `${origin}${path}`,
        size: stats.size,
      };
    });
  }
}

export default AvatarService;
