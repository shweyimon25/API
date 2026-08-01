import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const findProjectRoot = (startDir: string) => {
  let dir = startDir;

  while (true) {
    const hasPackageJson = fs.existsSync(path.join(dir, "package.json"));
    const hasPrismaSchema = fs.existsSync(
      path.join(dir, "prisma", "schema.prisma"),
    );

    if (hasPackageJson && hasPrismaSchema) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  return process.cwd();
};

/**
 * Resolve SQLite file URLs against the project root so relative paths like
 * file:./prisma/db/dev.db always open the same database file, whether running
 * from source (prisma/client.ts) or compiled output (dist/prisma/client.js).
 */
const resolveDatabaseUrl = (url: string) => {
  const filePath = url.replace(/^file:/, "");

  if (path.isAbsolute(filePath)) {
    return `file:${filePath}`;
  }

  const projectRoot = findProjectRoot(__dirname);
  const absolutePath = path.resolve(projectRoot, filePath);

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

  return `file:${absolutePath}`;
};

const adapter = new PrismaBetterSqlite3({
  url: resolveDatabaseUrl(
    process.env.DATABASE_URL ?? "file:./prisma/db/dev.db",
  ),
});

const prisma = new PrismaClient({ adapter });

export default prisma;
