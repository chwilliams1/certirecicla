import { contentPart1 } from "./content-part1";
import { contentPart2 } from "./content-part2";
import { contentPart3 } from "./content-part3";
import { contentPart4 } from "./content-part4";
import { contentPart5 } from "./content-part5";
import { contentPart6 } from "./content-part6";

const allContent: Record<string, string> = {
  ...contentPart1,
  ...contentPart2,
  ...contentPart3,
  ...contentPart4,
  ...contentPart5,
  ...contentPart6,
};

export function getArticleContent(slug: string): string | undefined {
  return allContent[slug];
}
