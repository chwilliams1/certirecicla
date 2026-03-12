import { contentPart1 } from "./content-part1";
import { contentPart2 } from "./content-part2";
import { contentPart3 } from "./content-part3";

const allContent: Record<string, string> = {
  ...contentPart1,
  ...contentPart2,
  ...contentPart3,
};

export function getArticleContent(slug: string): string | undefined {
  return allContent[slug];
}
