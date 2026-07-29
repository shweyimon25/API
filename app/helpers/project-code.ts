import prisma from "../../prisma/client";

export const PROJECT_CODE_PREFIX = "PMO";
export const PROJECT_CODE_PAD_LENGTH = 4;

export const formatProjectCode = (sequence: number) =>
  `${PROJECT_CODE_PREFIX}${String(sequence).padStart(PROJECT_CODE_PAD_LENGTH, "0")}`;

export const generateProjectCode = async () => {
  const projects = await prisma.project.findMany({
    where: {
      code: {
        startsWith: PROJECT_CODE_PREFIX,
      },
    },
    select: { code: true },
  });

  const maxSequence = projects.reduce((max, project) => {
    const match = project.code.match(/^PMO(\d+)$/);
    if (!match) {
      return max;
    }

    return Math.max(max, parseInt(match[1], 10));
  }, 0);

  return formatProjectCode(maxSequence + 1);
};
