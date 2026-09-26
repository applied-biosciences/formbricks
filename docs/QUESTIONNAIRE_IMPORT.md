# CALM Surveys questionnaire import

CALM Surveys includes a questionnaire migration/import workflow in the **New survey** menu.

## Supported input

The importer accepts JSON from the current Formbricks v3 survey API, either as the survey document itself or wrapped in a standard API response:

```json
{
  "data": {
    "name": "Example questionnaire",
    "type": "link",
    "blocks": [],
    "endings": []
  }
}
```

The importer keeps supported survey-definition fields such as blocks, endings, metadata, languages, hidden fields, variables, distribution and targeting.

It deliberately ignores source survey IDs, workspace IDs, timestamps and other write metadata. The destination workspace is always the workspace where the import is performed.

Every imported questionnaire is created as **draft**, regardless of the source status.

Historical response data is not imported.

## How to use

1. Open the destination CALM Surveys workspace.
2. Open **New survey**.
3. Choose **Import questionnaire**.
4. Upload a `.json` file or paste the survey JSON.
5. Review the detected questionnaire name and element count.
6. Select **Import questionnaire**.
7. The importer validates the payload through the same Formbricks v3 validation endpoint used for normal survey creation.
8. If validation succeeds, the new draft opens in the survey editor.

## Migration notes

For link questionnaires, current Formbricks v3 survey JSON should normally migrate without source-tenant dependencies.

App surveys can contain trigger and targeting references that are specific to the source workspace. Those references must exist in the destination workspace or validation will reject the import rather than creating a partially valid survey.

Legacy exports that contain only a `questions` array and no `blocks` are not accepted. Export those surveys through a current Formbricks v3 API first.

## Safety behaviour

- Maximum upload size is 5 MB.
- Invalid JSON is rejected before any write.
- The destination workspace ID is supplied by the authenticated CALM Surveys workspace, not trusted from the import file.
- Imports are always drafts.
- Existing responses are never copied.
- The standard Formbricks v3 create validation runs before creation.
- Enterprise licence checks and Formbricks permission checks are not bypassed.
