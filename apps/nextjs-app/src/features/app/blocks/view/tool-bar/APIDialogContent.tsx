import { useMutation, useQuery } from '@tanstack/react-query';
import { CellFormat, FieldKeyType, FieldType, type IFilterSet, type ISortItem } from '@teable/core';
import { ArrowUpRight, Code2, Copy, Check, Loader2, MagicAi, Key } from '@teable/icons';
import {
  createAccessToken,
  getFields,
  getTableById,
  type CreateAccessTokenVo,
  type IQueryBaseRo,
} from '@teable/openapi';
import { MarkdownPreview } from '@teable/sdk';
import { StandaloneViewProvider } from '@teable/sdk/context';
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
  ToggleGroup,
  ToggleGroupItem,
} from '@teable/ui-lib/shadcn';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { FilterBuilder } from '@/features/app/blocks/setting/query-builder/FilterBuilder';
import { PreviewScript } from '@/features/app/blocks/setting/query-builder/PreviewScript';
import { PreviewTable } from '@/features/app/blocks/setting/query-builder/PreviewTable';
import { SearchBuilder } from '@/features/app/blocks/setting/query-builder/SearchBuilder';
import { OrderByBuilder } from '@/features/app/blocks/setting/query-builder/SortBuilder';
import { ViewBuilder } from '@/features/app/blocks/setting/query-builder/ViewBuilder';
import { CopyButton } from '@/features/app/components/CopyButton';
import { useBaseResource } from '@/features/app/hooks/useBaseResource';
import type { IBaseResourceTable } from '@/features/app/hooks/useBaseResource';
import { tableConfig } from '@/features/i18n/table.config';

interface IFieldInfo {
  id: string;
  name: string;
  type: string;
  description?: string;
  options?: unknown;
  isPrimary?: boolean;
  isComputed?: boolean;
}

type TranslateFn = ReturnType<typeof useTranslation<typeof tableConfig.i18nNamespaces>>['t'];

const getFieldTypeDescription = (t: TranslateFn, type: FieldType, options?: unknown): string => {
  switch (type) {
    case FieldType.SingleLineText:
      return t('table:field.default.singleLineText.title');
    case FieldType.LongText:
      return t('table:field.default.longText.title');
    case FieldType.Number:
      return t('table:field.default.number.title');
    case FieldType.SingleSelect: {
      const opts = options as { choices?: { name: string }[] };
      const choices = opts?.choices?.map((c) => c.name).join(', ') || '';
      const label = t('table:field.default.singleSelect.title');
      return choices
        ? t('table:toolbar.others.api.fieldTypes.singleSelectWithOptions', { label, choices })
        : label;
    }
    case FieldType.MultipleSelect: {
      const opts = options as { choices?: { name: string }[] };
      const choices = opts?.choices?.map((c) => c.name).join(', ') || '';
      const label = t('table:field.default.multipleSelect.title');
      return choices
        ? t('table:toolbar.others.api.fieldTypes.multipleSelectWithOptions', { label, choices })
        : label;
    }
    case FieldType.Checkbox:
      return t('table:toolbar.others.api.fieldTypes.checkbox', {
        label: t('table:field.default.checkbox.title'),
      });
    case FieldType.Date:
      return t('table:field.default.date.title');
    case FieldType.Attachment:
      return t('table:field.default.attachment.title');
    case FieldType.Link:
      return t('table:toolbar.others.api.fieldTypes.link');
    case FieldType.Formula:
      return t('table:toolbar.others.api.fieldTypes.formula');
    case FieldType.Rollup:
    case FieldType.ConditionalRollup:
      return t('table:toolbar.others.api.fieldTypes.rollup');
    case FieldType.User:
      return t('table:toolbar.others.api.fieldTypes.user');
    case FieldType.CreatedTime:
      return t('table:toolbar.others.api.fieldTypes.createdTime', {
        label: t('table:field.default.createdTime.title'),
      });
    case FieldType.LastModifiedTime:
      return t('table:toolbar.others.api.fieldTypes.lastModifiedTime', {
        label: t('table:field.default.lastModifiedTime.title'),
      });
    case FieldType.CreatedBy:
      return t('table:toolbar.others.api.fieldTypes.createdBy', {
        label: t('table:field.default.createdBy.title'),
      });
    case FieldType.LastModifiedBy:
      return t('table:toolbar.others.api.fieldTypes.lastModifiedBy', {
        label: t('table:field.default.lastModifiedBy.title'),
      });
    case FieldType.AutoNumber:
      return t('table:toolbar.others.api.fieldTypes.autoNumber');
    case FieldType.Rating:
      return t('table:toolbar.others.api.fieldTypes.rating', {
        label: t('table:field.default.rating.title'),
      });
    case FieldType.Button:
      return t('table:toolbar.others.api.fieldTypes.button');
    default:
      return type;
  }
};

const TOKEN_PLACEHOLDER = '<YOUR_API_TOKEN>';

const generateAIContext = (
  t: TranslateFn,
  tableName: string,
  tableDescription: string | undefined,
  fields: IFieldInfo[],
  baseUrl: string,
  tableId: string,
  token?: string
): string => {
  const displayToken = token || TOKEN_PLACEHOLDER;
  const fieldDescriptions = fields
    .map((field) => {
      const typeDesc = getFieldTypeDescription(t, field.type as FieldType, field.options);
      const primary = field.isPrimary ? ` [${t('table:toolbar.others.api.markers.primary')}]` : '';
      const computed = field.isComputed
        ? ` [${t('table:toolbar.others.api.markers.readOnly')}]`
        : '';
      const desc = field.description ? ` - ${field.description}` : '';
      return `  - "${field.name}" [id: ${field.id}] (${typeDesc})${primary}${computed}${desc}`;
    })
    .join('\n');

  const editableFields = fields
    .filter((f) => !f.isComputed)
    .map((f) => `"${f.name}"`)
    .join(', ');

  return `# ${t('table:toolbar.others.api.aiDoc.table')}: ${tableName}
${tableDescription ? `\n${t('table:toolbar.others.api.aiDoc.description')}: ${tableDescription}\n` : ''}
## ${t('table:toolbar.others.api.aiDoc.apiOperations')}

### 1. ${t('table:toolbar.others.api.aiDoc.readRecords')} (GET)
\`\`\`bash
curl -X GET "${baseUrl}/api/table/${tableId}/record?fieldKeyType=name" \\
  -H "Authorization: Bearer ${displayToken}"
\`\`\`

#### ${t('table:toolbar.others.api.aiDoc.pagination')}
${t('table:toolbar.others.api.aiDoc.paginationUsage')}
- \`take\`: ${t('table:toolbar.others.api.aiDoc.takeDescription')}
- \`skip\`: ${t('table:toolbar.others.api.aiDoc.skipDescription')}

\`\`\`bash
# ${t('table:toolbar.others.api.aiDoc.paginationExample')}
curl "${baseUrl}/api/table/${tableId}/record?take=20&skip=40&fieldKeyType=name" \\
  -H "Authorization: Bearer ${displayToken}"
\`\`\`

#### ${t('table:toolbar.others.api.aiDoc.filtering')}
${t('table:toolbar.others.api.aiDoc.filteringUsage')}

**${t('table:toolbar.others.api.aiDoc.filterFieldIdImportant')}**

\`\`\`bash
# ${t('table:toolbar.others.api.aiDoc.filterExample')}
curl "${baseUrl}/api/table/${tableId}/record?fieldKeyType=name" \\
  --data-urlencode 'filter={"conjunction":"and","filterSet":[{"fieldId":"fldXXXXXXX","operator":"is","value":"${t('table:toolbar.others.api.aiDoc.filterExampleValue')}"}]}' \\
  -H "Authorization: Bearer ${displayToken}"
\`\`\`

**${t('table:toolbar.others.api.aiDoc.filterOperators')}**:
- ${t('table:toolbar.others.api.aiDoc.textOperators')}: \`is\`, \`isNot\`, \`contains\`, \`doesNotContain\`, \`isEmpty\`, \`isNotEmpty\`
- ${t('table:toolbar.others.api.aiDoc.numberOperators')}: \`is\`, \`isNot\`, \`isGreater\`, \`isLess\`, \`isGreaterEqual\`, \`isLessEqual\`
- ${t('table:toolbar.others.api.aiDoc.dateOperators')}: \`is\`, \`isBefore\`, \`isAfter\`, \`isWithin\`

#### ${t('table:toolbar.others.api.aiDoc.sorting')}
${t('table:toolbar.others.api.aiDoc.sortingUsage')}

**${t('table:toolbar.others.api.aiDoc.sortFieldIdImportant')}**

\`\`\`bash
# ${t('table:toolbar.others.api.aiDoc.sortExample')}
curl "${baseUrl}/api/table/${tableId}/record?fieldKeyType=name" \\
  --data-urlencode 'orderBy=[{"fieldId":"fldXXXXXXX","order":"desc"}]' \\
  -H "Authorization: Bearer ${displayToken}"
\`\`\`

#### ${t('table:toolbar.others.api.aiDoc.fieldSelection')}
${t('table:toolbar.others.api.aiDoc.fieldSelectionUsage')}
\`\`\`bash
# ${t('table:toolbar.others.api.aiDoc.fieldSelectionExample')}
  curl "${baseUrl}/api/table/${tableId}/record?fieldKeyType=name&projection=${t('table:toolbar.others.api.aiDoc.projectionFieldName')}&projection=${t('table:toolbar.others.api.aiDoc.projectionFieldEmail')}" \\
  -H "Authorization: Bearer ${displayToken}"
\`\`\`

#### ${t('table:toolbar.others.api.aiDoc.searching')}
${t('table:toolbar.others.api.aiDoc.searchingUsage')}
\`\`\`bash
# ${t('table:toolbar.others.api.aiDoc.searchExample')}
  curl "${baseUrl}/api/table/${tableId}/record?search=${t('table:toolbar.others.api.aiDoc.searchExampleValue')}&fieldKeyType=name" \\
  -H "Authorization: Bearer ${displayToken}"
\`\`\`

### 2. ${t('table:toolbar.others.api.aiDoc.createRecord')} (POST)
\`\`\`bash
curl -X POST "${baseUrl}/api/table/${tableId}/record" \\
  -H "Authorization: Bearer ${displayToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fieldKeyType": "name",
    "records": [
      {
        "fields": {
          // ${t('table:toolbar.others.api.aiDoc.editableFields')}: ${editableFields || t('table:toolbar.others.api.aiDoc.none')}
        }
      }
    ]
  }'
\`\`\`

### 3. ${t('table:toolbar.others.api.aiDoc.updateRecord')} (PATCH)
\`\`\`bash
curl -X PATCH "${baseUrl}/api/table/${tableId}/record/{recordId}" \\
  -H "Authorization: Bearer ${displayToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fieldKeyType": "name",
    "record": {
      "fields": {
        // ${t('table:toolbar.others.api.aiDoc.updateFieldsHint')}
      }
    }
  }'
\`\`\`

### 4. ${t('table:toolbar.others.api.aiDoc.deleteRecord')} (DELETE)
\`\`\`bash
curl -X DELETE "${baseUrl}/api/table/${tableId}/record/{recordId}" \\
  -H "Authorization: Bearer ${displayToken}"
\`\`\`

---

## ${t('table:toolbar.others.api.aiDoc.apiConfiguration')}
- **${t('table:toolbar.others.api.aiDoc.baseUrl')}**: ${baseUrl}
- **${t('table:toolbar.others.api.aiDoc.tableId')}**: ${tableId}
- **${t('table:toolbar.others.api.aiDoc.apiToken')}**: ${displayToken}
- **${t('table:toolbar.others.api.aiDoc.endpoint')}**: \`${baseUrl}/api/table/${tableId}/record\`

## ${t('table:toolbar.others.api.aiDoc.authentication')}
${t('table:toolbar.others.api.aiDoc.authenticationUsage')}
\`\`\`
Authorization: Bearer ${displayToken}
\`\`\`

---

## ${t('table:toolbar.others.api.aiDoc.fields')}
${fieldDescriptions}

---

## ${t('table:toolbar.others.api.aiDoc.notesForAi')}
- ${t('table:toolbar.others.api.aiDoc.primaryNote')}
- ${t('table:toolbar.others.api.aiDoc.readonlyNote')}
- ${t('table:toolbar.others.api.aiDoc.fieldKeyTypeNote')}
- **${t('table:toolbar.others.api.aiDoc.fieldIdNote')}**
- ${t('table:toolbar.others.api.aiDoc.dateFormatNote')}
- ${t('table:toolbar.others.api.aiDoc.selectFieldNote')}
- ${t('table:toolbar.others.api.aiDoc.linkFieldNote')}
- ${t('table:toolbar.others.api.aiDoc.responseFormatNote')}
`;
};

// Token Section Component
const TokenSection = ({
  generatedToken,
  isLoading,
  onGenerateToken,
}: {
  generatedToken: CreateAccessTokenVo | null;
  isLoading: boolean;
  onGenerateToken: () => void;
}) => {
  const { t } = useTranslation(tableConfig.i18nNamespaces);
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Key className="size-5 text-muted-foreground" />
          <span className="font-medium">{t('table:toolbar.others.api.token')}</span>
        </div>
        <div className="flex items-center gap-2">
          {generatedToken ? (
            <>
              <Input className="w-64 font-mono text-xs" readOnly value={generatedToken.token} />
              <CopyButton
                variant="outline"
                size="sm"
                text={generatedToken.token}
                iconClassName="size-4"
              />
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateToken}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('table:toolbar.others.api.generatingToken')}
                </>
              ) : (
                <>
                  <Key className="size-4" />
                  {t('table:toolbar.others.api.generateToken')}
                </>
              )}
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
            <Link href="/setting/personal-access-token" target="_blank">
              {t('table:toolbar.others.api.manageToken')}
              <ArrowUpRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>
      {generatedToken && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t('table:toolbar.others.api.tokenInfo', {
            expiry: new Date(generatedToken.expiredTime).toLocaleDateString(),
          })}
        </p>
      )}
    </div>
  );
};

// Advanced Query Builder Panel Component
const AdvancedQueryPanel = ({
  tableId,
  baseId,
  initialViewId,
}: {
  tableId: string;
  baseId: string;
  initialViewId?: string;
}) => {
  const { t } = useTranslation(tableConfig.i18nNamespaces);
  const [viewId, setViewId] = useState<string | undefined>(initialViewId);
  const [filter, setFilter] = useState<IFilterSet | null>(null);
  const [fieldKeyType, setFieldKeyType] = useState<FieldKeyType>(FieldKeyType.Name);
  const [cellFormat, setCellFormat] = useState<CellFormat>(CellFormat.Json);
  const [orderBy, setOrderBy] = useState<ISortItem[]>();
  const [search, setSearch] = useState<IQueryBaseRo['search']>();

  const query = useMemo(
    () => ({
      fieldKeyType,
      viewId,
      filter,
      orderBy,
      search,
      cellFormat,
    }),
    [fieldKeyType, viewId, filter, orderBy, search, cellFormat]
  );

  return (
    <StandaloneViewProvider baseId={baseId} tableId={tableId} viewId={viewId}>
      <div className="space-y-4">
        {/* Introduction */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-medium">{t('table:toolbar.others.api.queryBuilderTitle')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('table:toolbar.others.api.queryBuilderDesc')}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0 gap-1">
              <Link href={t('common:help.apiLink')} target="_blank">
                {t('table:toolbar.others.api.viewApiDocs')}
                <ArrowUpRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* View & Search */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('common:noun.view')}</label>
            <ViewBuilder viewId={viewId} onChange={setViewId} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('common:actions.search')}</label>
            <SearchBuilder search={search} onChange={setSearch} />
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('sdk:filter.label')}</label>
          <FilterBuilder filter={filter} onChange={setFilter} />
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('sdk:sort.label')}</label>
          <OrderByBuilder orderBy={orderBy} onChange={setOrderBy} />
        </div>

        {/* Format Options */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('developer:cellFormat')}</label>
            <ToggleGroup
              className="w-auto justify-start"
              variant="outline"
              type="single"
              size="sm"
              value={cellFormat}
              onValueChange={(v) => setCellFormat((v as CellFormat) || CellFormat.Json)}
            >
              <ToggleGroupItem value="json">{t('table:toolbar.others.api.json')}</ToggleGroupItem>
              <ToggleGroupItem value="text">{t('table:text')}</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('developer:fieldKeyType')}</label>
            <ToggleGroup
              className="w-auto justify-start"
              variant="outline"
              type="single"
              size="sm"
              value={fieldKeyType}
              onValueChange={(v) => setFieldKeyType((v as FieldKeyType) || FieldKeyType.Name)}
            >
              <ToggleGroupItem value="name">{t('developer:fieldKeyTypeName')}</ToggleGroupItem>
              <ToggleGroupItem value="id">{t('developer:fieldKeyTypeId')}</ToggleGroupItem>
              <ToggleGroupItem value="dbFieldName">
                {t('developer:fieldKeyTypeDbFieldName')}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Preview Script */}
        <div className="border-t pt-4">
          <h3 className="mb-4 text-sm font-medium">{t('developer:buildResult')}</h3>
          <PreviewScript tableId={tableId} query={query} />
        </div>

        {/* Preview Return Value */}
        <div className="border-t pt-4">
          <h3 className="mb-4 text-sm font-medium">{t('developer:previewReturnValue')}</h3>
          <PreviewTable query={query} />
        </div>

        {/* Open in new tab link */}
        <div className="flex justify-end border-t pt-4">
          <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
            <Link
              href={`/developer/tool/query-builder?baseId=${baseId}&tableId=${tableId}`}
              target="_blank"
            >
              {t('table:toolbar.others.api.openInNewTab')}
              <ArrowUpRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>
    </StandaloneViewProvider>
  );
};

export interface APIDialogContentProps {
  onOpenChange: (open: boolean) => void;
}

export const APIDialogContent = ({ onOpenChange: _onOpenChange }: APIDialogContentProps) => {
  const { t } = useTranslation(tableConfig.i18nNamespaces);
  const { baseId, tableId, viewId } = useBaseResource() as IBaseResourceTable;
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [generatedToken, setGeneratedToken] = useState<CreateAccessTokenVo | null>(null);
  const [showTokenConfirm, setShowTokenConfirm] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.origin);
  }, []);

  // Fetch table info
  const { data: tableInfo } = useQuery({
    queryKey: ['table-info-api-dialog', baseId, tableId],
    queryFn: () => getTableById(baseId, tableId).then((res) => res.data),
    enabled: Boolean(tableId) && Boolean(baseId),
  });

  // Fetch fields
  const { data: fieldsData } = useQuery({
    queryKey: ['fields-api-dialog', tableId],
    queryFn: () => getFields(tableId).then((res) => res.data),
    enabled: Boolean(tableId),
  });

  // Create token mutation
  const createTokenMutation = useMutation({
    mutationFn: async () => {
      const expiredTime = new Date();
      expiredTime.setFullYear(expiredTime.getFullYear() + 1);

      return createAccessToken({
        name: t('table:toolbar.others.api.generatedToken.name', {
          tableName: tableInfo?.name || t('table:toolbar.others.api.aiDoc.table'),
        }),
        description: t('table:toolbar.others.api.generatedToken.description', {
          baseId,
          tableId,
        }),
        scopes: [
          'table|read',
          'field|read',
          'record|read',
          'record|create',
          'record|update',
          'record|delete',
        ],
        baseIds: [baseId],
        expiredTime: expiredTime.toISOString(),
      });
    },
    onSuccess: (res) => {
      setGeneratedToken(res.data);
    },
  });

  const handleConfirmCreateToken = useCallback(() => {
    setShowTokenConfirm(false);
    createTokenMutation.mutate();
  }, [createTokenMutation]);

  const fields: IFieldInfo[] = useMemo(() => {
    if (!fieldsData) return [];
    return fieldsData.map((field) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      description: field.description,
      options: field.options,
      isPrimary: field.isPrimary,
      isComputed: field.isComputed,
    }));
  }, [fieldsData]);

  const aiContext = useMemo(() => {
    if (!tableInfo) return '';
    return generateAIContext(
      t,
      tableInfo.name,
      tableInfo.description,
      fields,
      currentUrl,
      tableId,
      generatedToken?.token
    );
  }, [t, tableInfo, fields, currentUrl, tableId, generatedToken]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(aiContext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [aiContext]);

  const isLoading = createTokenMutation.isPending;
  const isDataLoading = !tableInfo || !fieldsData;

  return (
    <Tabs defaultValue="ai-context" className="flex min-h-0 flex-1 flex-col">
      <TabsList className="mb-4 w-fit">
        <TabsTrigger value="ai-context" className="gap-2">
          <MagicAi className="size-4" />
          {t('table:toolbar.others.api.aiContext')}
        </TabsTrigger>
        <TabsTrigger value="advanced" className="gap-2">
          <Code2 className="size-4" />
          {t('table:toolbar.others.api.advanced')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ai-context" className="mt-0 flex min-h-0 flex-1 flex-col">
        {isDataLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">{t('common:actions.loading')}</span>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {/* Token Section */}
            <TokenSection
              generatedToken={generatedToken}
              isLoading={isLoading}
              onGenerateToken={() => setShowTokenConfirm(true)}
            />

            {/* AI Document Preview */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="mb-2 flex shrink-0 items-center justify-between">
                <span className="text-sm font-medium">
                  {t('table:toolbar.others.api.aiDocPreview')}
                </span>
                <Button onClick={handleCopy} size="sm" className="gap-2">
                  {copied ? (
                    <>
                      <Check className="size-4" />
                      {t('table:toolbar.others.api.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      {t('table:toolbar.others.api.copyAIDoc')}
                    </>
                  )}
                </Button>
              </div>
              <ScrollArea className="h-[400px] rounded-lg border bg-muted/20 p-4">
                <MarkdownPreview>{aiContext}</MarkdownPreview>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Token Creation Confirmation Dialog */}
        <AlertDialog open={showTokenConfirm} onOpenChange={setShowTokenConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('table:toolbar.others.api.confirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>{t('table:toolbar.others.api.confirmDescription')}</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>{t('table:toolbar.others.api.scopeTableRead')}</li>
                  <li>{t('table:toolbar.others.api.scopeFieldRead')}</li>
                  <li>{t('table:toolbar.others.api.scopeRead')}</li>
                  <li>{t('table:toolbar.others.api.scopeCreate')}</li>
                  <li>{t('table:toolbar.others.api.scopeUpdate')}</li>
                  <li>{t('table:toolbar.others.api.scopeDelete')}</li>
                </ul>
                <p>{t('table:toolbar.others.api.confirmExpiry')}</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCreateToken}>
                {t('table:toolbar.others.api.confirmButton')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TabsContent>

      <TabsContent value="advanced" className="mt-0 min-h-0 flex-1 overflow-auto">
        <ScrollArea className="h-full">
          <AdvancedQueryPanel tableId={tableId} baseId={baseId} initialViewId={viewId} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};
