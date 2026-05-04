import { appModeConfigSchema, type IAppModePage } from '@teable/openapi';
import { useAppModeConfigEditor } from '@teable/sdk/hooks';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  useToast,
} from '@teable/ui-lib/shadcn';
import { useEffect, useState } from 'react';

const splitIds = (text: string) =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const emptyPageDraft: IAppModePage = {
  id: '',
  name: '',
  type: 'list',
};

export const AppModeConfigEditorCard = ({ baseId }: { baseId: string }) => {
  const { toast } = useToast();
  const editor = useAppModeConfigEditor(baseId);
  const [newPage, setNewPage] = useState<IAppModePage>(emptyPageDraft);
  const [linkedBaseIdsText, setLinkedBaseIdsText] = useState('');
  const [dashboardIdsText, setDashboardIdsText] = useState('');
  const [jsonText, setJsonText] = useState('');

  useEffect(() => {
    setLinkedBaseIdsText(editor.draft?.linkedBaseIds.join(', ') ?? '');
    setDashboardIdsText(editor.draft?.dashboardIds.join(', ') ?? '');
  }, [editor.draft?.linkedBaseIds, editor.draft?.dashboardIds]);

  if (!editor.config || !editor.draft) {
    return null;
  }

  const draft = editor.draft;

  const canSave = editor.isDirty && editor.draftValidation.ok && !editor.isUpdating;

  const movePage = (pageId: string, direction: -1 | 1) => {
    const index = draft.pages.findIndex((page) => page.id === pageId);
    if (index < 0) {
      return;
    }

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draft.pages.length) {
      return;
    }

    editor.patchDraft((config) => {
      const nextPages = [...config.pages];
      const current = nextPages[index];
      nextPages[index] = nextPages[targetIndex];
      nextPages[targetIndex] = current;
      return {
        ...config,
        pages: nextPages,
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">App mode config</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Version {draft.version}</Badge>
          <Badge variant={draft.workflowEnabled ? 'default' : 'secondary'}>
            Workflow {draft.workflowEnabled ? 'enabled' : 'disabled'}
          </Badge>
          {editor.isDirty ? <Badge variant="outline">Draft changed</Badge> : null}
        </div>

        <div className="flex items-center justify-between rounded border px-3 py-2">
          <div>
            <Label>Workflow enabled</Label>
          </div>
          <Switch
            checked={draft.workflowEnabled}
            onCheckedChange={(checked) => editor.setWorkflowEnabled(checked)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Linked base IDs</Label>
          <Input
            placeholder="baseA, baseB"
            value={linkedBaseIdsText}
            onChange={(event) => setLinkedBaseIdsText(event.target.value)}
            onBlur={() => editor.setLinkedBaseIds(splitIds(linkedBaseIdsText))}
          />
        </div>

        <div className="grid gap-2">
          <Label>Dashboard IDs</Label>
          <Input
            placeholder="dashA, dashB"
            value={dashboardIdsText}
            onChange={(event) => setDashboardIdsText(event.target.value)}
            onBlur={() => editor.setDashboardIds(splitIds(dashboardIdsText))}
          />
        </div>

        <div className="grid gap-3 rounded border p-3">
          <Label>Governance</Label>
          <div className="grid gap-2">
            <Label>Role matrix version</Label>
            <Input
              type="number"
              min={1}
              value={String(draft.governance.roleMatrixVersion)}
              onChange={(event) => {
                const value = Number(event.target.value);
                editor.setGovernance({
                  roleMatrixVersion: Number.isFinite(value) && value > 0 ? value : 1,
                });
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label>Audit policy</Label>
            <Select
              value={draft.governance.auditPolicy}
              onValueChange={(value) =>
                editor.setGovernance({
                  auditPolicy: value as 'strict' | 'standard',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">standard</SelectItem>
                <SelectItem value="strict">strict</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Permission mode</Label>
            <Select
              value={draft.governance.permissionMode}
              onValueChange={(value) =>
                editor.setGovernance({
                  permissionMode: value as 'inherited' | 'isolated',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherited">inherited</SelectItem>
                <SelectItem value="isolated">isolated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2 rounded border p-3">
          <Label>Add page</Label>
          <Input
            placeholder="Page id"
            value={newPage.id}
            onChange={(event) => setNewPage((state) => ({ ...state, id: event.target.value }))}
          />
          <Input
            placeholder="Page name"
            value={newPage.name}
            onChange={(event) => setNewPage((state) => ({ ...state, name: event.target.value }))}
          />
          <Select
            value={newPage.type}
            onValueChange={(value) =>
              setNewPage((state) => ({ ...state, type: value as IAppModePage['type'] }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">list</SelectItem>
              <SelectItem value="detail">detail</SelectItem>
              <SelectItem value="dashboard">dashboard</SelectItem>
              <SelectItem value="form">form</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!newPage.id.trim() || !newPage.name.trim()) {
                toast({
                  title: 'Page id and name are required',
                  variant: 'destructive',
                });
                return;
              }

              if (draft.pages.some((page) => page.id === newPage.id.trim())) {
                toast({
                  title: 'Duplicate page id',
                  description: 'Please use a unique page id.',
                  variant: 'destructive',
                });
                return;
              }

              editor.addPage({
                ...newPage,
                id: newPage.id.trim(),
                name: newPage.name.trim(),
              });
              setNewPage(emptyPageDraft);
            }}
          >
            Add page
          </Button>
        </div>

        <div className="space-y-2 rounded border p-3">
          <Label>Pages</Label>
          {editor.draft.pages.length ? (
            draft.pages.map((page) => (
              <div key={page.id} className="space-y-2 rounded border p-2">
                <div className="grid gap-2">
                  <Input
                    value={page.name}
                    onChange={(event) =>
                      editor.updatePage(page.id, (state) => ({
                        ...state,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Page name"
                  />
                  <div className="grid grid-cols-[1fr_1fr] gap-2">
                    <Input
                      value={page.id}
                      onChange={(event) =>
                        editor.updatePage(page.id, (state) => ({
                          ...state,
                          id: event.target.value.trim(),
                        }))
                      }
                      placeholder="Page id"
                    />
                    <Select
                      value={page.type}
                      onValueChange={(value) =>
                        editor.updatePage(page.id, (state) => ({
                          ...state,
                          type: value as IAppModePage['type'],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="list">list</SelectItem>
                        <SelectItem value="detail">detail</SelectItem>
                        <SelectItem value="dashboard">dashboard</SelectItem>
                        <SelectItem value="form">form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    value={page.sourceId ?? ''}
                    onChange={(event) =>
                      editor.updatePage(page.id, (state) => ({
                        ...state,
                        sourceId: event.target.value.trim() || undefined,
                      }))
                    }
                    placeholder="Optional sourceId"
                  />
                </div>
                <div className="flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => movePage(page.id, -1)}>
                    Up
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => movePage(page.id, 1)}>
                    Down
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => editor.removePage(page.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No pages configured yet.</div>
          )}
        </div>

        {!editor.draftValidation.ok ? (
          <Alert variant="destructive">
            <AlertTitle>Draft invalid</AlertTitle>
            <AlertDescription>{editor.draftValidation.reason}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-2 rounded border p-3">
          <Label>JSON import/export</Label>
          <Input
            placeholder="Paste app mode config JSON"
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setJsonText(JSON.stringify(draft, null, 2))}
            >
              Export draft JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                try {
                  const parsed = JSON.parse(jsonText);
                  const validated = appModeConfigSchema.safeParse(parsed);
                  if (!validated.success) {
                    toast({
                      title: 'Invalid app mode config',
                      description: validated.error.issues[0]?.message ?? 'Schema validation failed',
                      variant: 'destructive',
                    });
                    return;
                  }
                  editor.patchDraft(() => validated.data);
                  toast({ title: 'Imported JSON to draft' });
                } catch {
                  toast({
                    title: 'Invalid JSON',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Import JSON
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!canSave}
            onClick={async () => {
              try {
                await editor.saveDraft();
                toast({ title: 'App mode config saved' });
              } catch (error) {
                toast({
                  title: 'Failed to save app mode config',
                  description: error instanceof Error ? error.message : 'Unknown error',
                  variant: 'destructive',
                });
              }
            }}
          >
            Save app mode
          </Button>
          <Button size="sm" variant="outline" onClick={() => editor.resetDraft()}>
            Reset draft
          </Button>
          <Button size="sm" variant="outline" onClick={() => editor.refetch()}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
