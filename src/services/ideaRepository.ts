import type { PlayerProfile } from "../domain/profiles";
import type { CreatorAnswers, StructuredIdea } from "../features/creator/creatorModel";
import { supabase } from "./supabase";

export type IdeaInputMethod = "text" | "voice";

export type IdeaDraft = {
  originalText: string;
  answers: CreatorAnswers;
  structuredIdea: StructuredIdea;
  inputMethod: IdeaInputMethod;
};

export type IdeaSaveResult = {
  id: string;
  storage: "supabase" | "local";
};

const LOCAL_KEY = "sternenreiter.pending-ideas";

function saveLocal(profile: PlayerProfile, draft: IdeaDraft): IdeaSaveResult {
  const id = crypto.randomUUID();
  const existingRaw = window.localStorage.getItem(LOCAL_KEY);
  const existing = existingRaw ? (JSON.parse(existingRaw) as unknown[]) : [];

  existing.push({
    id,
    profileId: profile.id,
    createdAt: new Date().toISOString(),
    ...draft
  });

  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
  return { id, storage: "local" };
}

export async function saveIdea(
  profile: PlayerProfile,
  draft: IdeaDraft
): Promise<IdeaSaveResult> {
  if (!supabase) {
    return saveLocal(profile, draft);
  }

  const { data: idea, error } = await supabase
    .from("ideas")
    .insert({
      profile_id: profile.databaseId,
      idea_type: "free_world_idea",
      original_text: draft.originalText,
      structured_idea: draft.structuredIdea,
      status: "submitted",
      input_method: draft.inputMethod
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const answers = Object.entries(draft.answers)
    .filter(([, value]) => Boolean(value?.trim()))
    .map(([key, value]) => ({
      idea_id: idea.id,
      question_key: key,
      question_text: key,
      answer_text: value
    }));

  if (answers.length > 0) {
    const { error: answersError } = await supabase.from("idea_answers").insert(answers);
    if (answersError) {
      throw new Error(answersError.message);
    }
  }

  return { id: idea.id as string, storage: "supabase" };
}
