"use client";

import { FileUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getV3ApiErrorMessage } from "@/modules/api/lib/v3-client";
import {
  createV3Survey,
  validateSurveyCreatePayload,
} from "@/modules/survey/list/lib/v3-surveys-client";
import {
  getImportedSurveySummary,
  normalizeImportedSurvey,
} from "@/modules/survey/import/lib/normalize-import";
import { Alert, AlertDescription, AlertTitle } from "@/modules/ui/components/alert";
import { Button } from "@/modules/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/ui/components/dialog";
import { Textarea } from "@/modules/ui/components/textarea";

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

interface ImportSurveyDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportSurveyDialog = ({
  workspaceId,
  open,
  onOpenChange,
}: Readonly<ImportSurveyDialogProps>) => {
  const router = useRouter();
  const [jsonText, setJsonText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const preview = useMemo(() => {
    if (!jsonText.trim()) return null;

    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const payload = normalizeImportedSurvey(parsed, workspaceId);
      return getImportedSurveySummary(payload);
    } catch {
      return null;
    }
  }, [jsonText, workspaceId]);

  const reset = () => {
    setJsonText("");
    setFileName(null);
    setErrors([]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isImporting) return;
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setErrors([]);

    if (file.size > MAX_IMPORT_BYTES) {
      setErrors(["The import file is larger than 5 MB."]);
      event.currentTarget.value = "";
      return;
    }

    try {
      const text = await file.text();
      JSON.parse(text);
      setJsonText(text);
      setFileName(file.name);
    } catch {
      setErrors(["The selected file is not valid JSON."]);
      event.currentTarget.value = "";
    }
  };

  const handleImport = async () => {
    setErrors([]);

    if (!jsonText.trim()) {
      setErrors(["Choose a JSON file or paste a Formbricks survey JSON document."]);
      return;
    }

    setIsImporting(true);

    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const payload = normalizeImportedSurvey(parsed, workspaceId);
      const validation = await validateSurveyCreatePayload(payload);

      if (!validation.valid) {
        setErrors(
          validation.invalid_params
            .slice(0, 10)
            .map((issue) => `${issue.name}: ${issue.reason}`)
        );
        return;
      }

      const survey = await createV3Survey(payload);
      toast.success("Questionnaire imported as a draft");
      reset();
      onOpenChange(false);
      router.push(`/workspaces/${workspaceId}/surveys/${survey.id}/edit`);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setErrors(["The questionnaire JSON could not be parsed."]);
        return;
      }

      if (error instanceof Error && !("status" in error)) {
        setErrors([error.message]);
        return;
      }

      setErrors([
        getV3ApiErrorMessage(
          error,
          "The questionnaire could not be imported. Check the JSON and try again."
        ),
      ]);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent width="default">
        <DialogHeader>
          <FileUpIcon />
          <DialogTitle>Import questionnaire</DialogTitle>
          <DialogDescription>
            Import a questionnaire from a current Formbricks v3 survey JSON document or API response.
            The questionnaire is always created as a draft in this workspace.
          </DialogDescription>
        </DialogHeader>

        <DialogBody unconstrained className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="survey-import-file" className="text-sm font-medium text-slate-700">
              JSON file
            </label>
            <input
              id="survey-import-file"
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              disabled={isImporting}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-purple-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-purple-800 hover:file:bg-purple-200"
            />
            {fileName ? <p className="text-xs text-slate-500">Loaded: {fileName}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="survey-import-json" className="text-sm font-medium text-slate-700">
              Or paste survey JSON
            </label>
            <Textarea
              id="survey-import-json"
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value);
                setFileName(null);
                setErrors([]);
              }}
              disabled={isImporting}
              className="h-48 resize-y font-mono text-xs"
              placeholder={'{"data":{"name":"My questionnaire","type":"link","blocks":[...]}}'}
            />
          </div>

          {preview ? (
            <Alert variant="info" role="status">
              <AlertTitle>{preview.name}</AlertTitle>
              <AlertDescription>
                {preview.type} survey · {preview.blockCount} blocks · {preview.questionCount} elements.
                It will be imported as a draft.
              </AlertDescription>
            </Alert>
          ) : null}

          {errors.length > 0 ? (
            <Alert variant="error">
              <AlertTitle>Import needs attention</AlertTitle>
              <AlertDescription>
                <ul className="list-disc space-y-1 pl-4">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null}

          <p className="text-xs leading-5 text-slate-500">
            Existing response data is not imported. Source workspace IDs, survey IDs, timestamps and
            publication state are ignored. App-survey triggers or targeting references must already
            exist in the destination workspace or validation will reject the import.
          </p>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImport} loading={isImporting} disabled={!jsonText.trim()}>
            Import questionnaire
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
