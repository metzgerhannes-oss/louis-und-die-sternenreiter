export type CreatorQuestionKey = "place" | "look" | "activity" | "special";

export type CreatorAnswers = Partial<Record<CreatorQuestionKey, string>>;

export const creatorQuestions: readonly {
  key: CreatorQuestionKey;
  prompt: string;
}[] = [
  {
    key: "place",
    prompt: "Wo oder wann soll deine Idee in unserer Sternenwelt vorkommen?"
  },
  {
    key: "look",
    prompt: "Was sieht, hört oder bemerkt man dort als Erstes?"
  },
  {
    key: "activity",
    prompt: "Was können die Sternenreiter dort entdecken, reparieren, lösen oder jemandem helfen?"
  },
  {
    key: "special",
    prompt: "Was ist das Besondere, das man von dieser Idee unbedingt behalten muss?"
  }
] as const;

export type StructuredIdea = {
  type: "free_world_idea";
  summary: string;
  place: string;
  look: string;
  activity: string;
  special: string;
};

export function buildStructuredIdea(originalText: string, answers: CreatorAnswers): StructuredIdea {
  return {
    type: "free_world_idea",
    summary: originalText.trim(),
    place: answers.place?.trim() ?? "",
    look: answers.look?.trim() ?? "",
    activity: answers.activity?.trim() ?? "",
    special: answers.special?.trim() ?? ""
  };
}
