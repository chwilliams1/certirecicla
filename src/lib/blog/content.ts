import { contentPart1 } from "./content-part1";
import { contentPart2 } from "./content-part2";

const allContent: Record<string, string> = {
  ...contentPart1,
  ...contentPart2,
};

export function getArticleContent(slug: string): string | undefined {
  return allContent[slug];
}
