import type { TV3CreateSurveyBody } from "@/app/api/v3/surveys/schemas";

const V3_CREATE_ROOT_KEYS = [
  "name",
  "type",
  "metadata",
  "defaultLanguage",
  "languages",
  "welcomeCard",
  "blocks",
  "endings",
  "hiddenFields",
  "variables",
  "distribution",
  "targeting",
] as const;

type TJsonObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is TJsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapSurveyDocument(value: unknown): TJsonObject {
  if (!isPlainObject(value)) {
    throw new Error("The import file must contain a JSON object.");
  }

  if (isPlainObject(value.data)) {
    return value.data;
  }

  return value;
}

/**
 * Convert a Formbricks v3 survey document or v3 API response into a create payload for this
 * workspace. Source tenant identifiers and write metadata are deliberately ignored. Every import
 * starts as a draft so importing a questionnaire can never publish it accidentally.
 *
 * This supports current Formbricks survey JSON (the shape returned by the v3 survey API or the
 * corresponding create document). Legacy exports that only contain `questions` and no `blocks`
 * need to be migrated by the source Formbricks version first.
 */
export function normalizeImportedSurvey(
  raw: unknown,
  targetWorkspaceId: string
): TV3CreateSurveyBody {
  const source = unwrapSurveyDocument(raw);

  if (typeof source.name !== "string" || source.name.trim().length === 0) {
    throw new Error("The imported questionnaire does not have a valid name.");
  }

  if (!Array.isArray(source.blocks)) {
    if (Array.isArray(source.questions)) {
      throw new Error(
        "This looks like a legacy Formbricks export. Export the questionnaire from the current v3 API so it contains blocks, then import that JSON."
      );
    }

    throw new Error("The imported questionnaire does not contain Formbricks survey blocks.");
  }

  const payload: Record<string, unknown> = {
    workspaceId: targetWorkspaceId,
    status: "draft",
  };

  for (const key of V3_CREATE_ROOT_KEYS) {
    if (source[key] !== undefined) {
      payload[key] = source[key];
    }
  }

  // Never trust the source document's publication state or tenant anchor.
  payload.workspaceId = targetWorkspaceId;
  payload.status = "draft";

  return payload as TV3CreateSurveyBody;
}

export function getImportedSurveySummary(payload: TV3CreateSurveyBody) {
  const questionCount = payload.blocks.reduce(
    (total, block) => total + (Array.isArray(block.elements) ? block.elements.length : 0),
    0
  );

  return {
    name: payload.name,
    type: payload.type,
    blockCount: payload.blocks.length,
    questionCount,
  };
}
