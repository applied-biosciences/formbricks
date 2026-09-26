import { describe, expect, test } from "vitest";
import { normalizeImportedSurvey } from "./normalize-import";

const workspaceId = "cm123456789012345678901234";

describe("normalizeImportedSurvey", () => {
  test("unwraps a v3 API response, replaces workspace id and forces draft", () => {
    const result = normalizeImportedSurvey(
      {
        data: {
          id: "source-survey-id",
          workspaceId: "source-workspace-id",
          name: "Imported questionnaire",
          type: "link",
          status: "inProgress",
          blocks: [],
          endings: [],
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      },
      workspaceId
    );

    expect(result.workspaceId).toBe(workspaceId);
    expect(result.status).toBe("draft");
    expect(result.name).toBe("Imported questionnaire");
    expect("id" in result).toBe(false);
    expect("createdAt" in result).toBe(false);
  });

  test("rejects legacy question-only exports", () => {
    expect(() =>
      normalizeImportedSurvey(
        {
          name: "Legacy",
          questions: [{ id: "q1" }],
        },
        workspaceId
      )
    ).toThrow(/legacy Formbricks export/i);
  });
});
