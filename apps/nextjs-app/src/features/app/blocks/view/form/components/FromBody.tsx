import { Loader2 } from '@teable/icons';
import { LocalStorageKeys } from '@teable/sdk/config';
import { useFields, useTableId, useView } from '@teable/sdk/hooks';
import { type FormView } from '@teable/sdk/model';
import { Button, cn } from '@teable/ui-lib/shadcn';
import { toast } from '@teable/ui-lib/shadcn/ui/sonner';
import { omit } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage, useMap, useSet } from 'react-use';
import { usePreviewUrl } from '@/features/app/hooks/usePreviewUrl';
import { useOptionalPublishedApp } from '@/features/app/published-app';
import { tableConfig } from '@/features/i18n/table.config';
import { generateUniqLocalKey, getLocalizedDefaultFieldName } from '../util';
import { FormField } from './FormField';

interface IFormBodyProps {
  className?: string;
  submit?: (fields: Record<string, unknown>) => Promise<void>;
}

export const FormBody = (props: IFormBodyProps) => {
  const { className, submit } = props;
  const tableId = useTableId();
  const view = useView() as FormView | undefined;
  const fields = useFields();
  const { t } = useTranslation(tableConfig.i18nNamespaces);
  const localKey = generateUniqLocalKey(tableId, view?.id);
  const [formDataMap, setFormDataMap] = useLocalStorage<Record<string, Record<string, unknown>>>(
    LocalStorageKeys.ViewFromData,
    {}
  );
  const [formData, { set: setFormData, setAll: initFormData, remove: removeFormData }] = useMap<
    Record<string, unknown>
  >(formDataMap?.[localKey] ?? {});
  const [errors, { add: addError, remove: removeError, reset: resetErrors }] = useSet<string>(
    new Set([])
  );
  const [loading, setLoading] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const previewUrl = usePreviewUrl();
  const publishedApp = useOptionalPublishedApp();

  const visibleFields = useMemo(
    () => fields.filter(({ isComputed, isLookup }) => !isComputed && !isLookup),
    [fields]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const viewport = window.visualViewport;
    const updateInset = () => {
      const nextInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardInset(nextInset > 120 ? nextInset : 0);
    };

    updateInset();
    viewport.addEventListener('resize', updateInset);
    viewport.addEventListener('scroll', updateInset);

    return () => {
      viewport.removeEventListener('resize', updateInset);
      viewport.removeEventListener('scroll', updateInset);
    };
  }, []);

  if (view == null) return null;

  const { name, description, columnMeta } = view;
  const errorFieldNames = visibleFields
    .filter((field) => errors.has(field.id))
    .map((field) => getLocalizedDefaultFieldName(field, t) ?? field.name ?? t('untitled'));

  const onChange = (fieldId: string, value: unknown) => {
    if (errors.has(fieldId) && value != null && value != '') {
      removeError(fieldId);
    }

    if (value == null) {
      removeFormData(fieldId);
      return setTimeout(() =>
        setFormDataMap({ ...formDataMap, [localKey]: omit(formData, fieldId) })
      );
    }

    setFormData(fieldId, value);

    // Store to local storage
    setTimeout(() =>
      setFormDataMap({
        ...formDataMap,
        [localKey]: {
          ...formData,
          [fieldId]: value,
        },
      })
    );
  };

  const onVerify = () => {
    resetErrors();

    const requiredFieldIds = visibleFields.reduce((acc, field) => {
      if (field.notNull || columnMeta[field.id].required) acc.push(field.id);
      return acc;
    }, [] as string[]);

    if (!requiredFieldIds.length) return true;

    let firstErrorFieldId = '';

    requiredFieldIds.forEach((fieldId) => {
      if (formData[fieldId] != null) return;
      if (!firstErrorFieldId) firstErrorFieldId = fieldId;
      addError(fieldId);
    });

    if (!firstErrorFieldId) return true;

    document
      .getElementById(`form-field-${firstErrorFieldId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  };

  const onReset = () => {
    setLoading(false);
    initFormData({});
    setFormDataMap(omit(formDataMap, [localKey]));
  };

  const onSubmit = async () => {
    if (!onVerify()) return;

    setLoading(true);
    if (submit) {
      const finalData = visibleFields.reduce(
        (acc, field) => {
          acc[field.id] = formData[field.id];
          return acc;
        },
        {} as Record<string, unknown>
      );
      await submit(finalData);
      setTimeout(() => {
        onReset();
        toast.success(t('actions.submitSucceed'));
      }, 1000);
    }
  };

  const { coverUrl, logoUrl, submitLabel } = view?.options ?? {};

  return (
    <div className={className}>
      <div
        className={cn(
          'relative h-36 w-full',
          !coverUrl &&
            'bg-gradient-to-tr from-green-400 via-blue-400 to-blue-600 dark:from-green-600 dark:via-blue-600 dark:to-blue-900'
        )}
      >
        {coverUrl && (
          <img
            src={previewUrl(coverUrl)}
            alt={t('oauth:authorization.cardCoverAlt')}
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>

      {logoUrl && (
        <div className="group absolute left-1/2 top-[104px] ml-[-40px] size-20">
          <img
            className="absolute inset-0 size-full rounded-lg object-cover shadow-sm"
            src={previewUrl(logoUrl)}
            alt={t('oauth:authorization.cardCoverAlt')}
          />
        </div>
      )}

      <div
        className={cn(
          'mb-6 w-full px-6 text-center text-3xl leading-9 sm:px-12',
          logoUrl ? 'mt-16' : 'mt-8'
        )}
        style={{ overflowWrap: 'break-word' }}
      >
        {name ?? t('untitled')}
      </div>

      {description && (
        <div className="mb-4 w-full whitespace-pre-line px-6 sm:px-12">{description}</div>
      )}

      {Boolean(visibleFields.length) && (
        <div className="w-full px-6 sm:px-12">
          {errorFieldNames.length > 0 ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <div className="font-medium">{t('required')}</div>
              <div className="mt-1 text-xs">
                {t('form.requiredFieldsBeforeSubmit', {
                  fields: errorFieldNames.slice(0, 3).join(', '),
                })}
                {errorFieldNames.length > 3
                  ? t('form.requiredFieldsMore', { count: errorFieldNames.length - 3 })
                  : ''}
              </div>
            </div>
          ) : null}
          {visibleFields.map((field) => {
            const { id: fieldId } = field;
            return (
              <FormField
                key={fieldId}
                field={field}
                value={formData[fieldId] ?? null}
                errors={errors}
                onChange={(value) => onChange(fieldId, value)}
              />
            );
          })}

          <div
            className={cn('mb-12 mt-8 flex w-full justify-center sm:mb-0 sm:px-12', {
              'sticky bottom-0 z-10 -mx-6 border-t bg-background/95 px-6 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 backdrop-blur sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-12 sm:pb-0':
                Boolean(publishedApp),
            })}
            style={
              publishedApp
                ? { paddingBottom: `calc(env(safe-area-inset-bottom) + 16px + ${keyboardInset}px)` }
                : undefined
            }
          >
            <div className="flex w-full flex-col items-center gap-2">
              <Button
                className="w-full text-base sm:w-56"
                size={'lg'}
                onClick={onSubmit}
                disabled={loading || !submit}
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {submitLabel || t('common:actions.submit')}
              </Button>
              {publishedApp?.isReadonly && !submit ? (
                <p className="text-center text-xs text-muted-foreground">
                  {t('form.readonlySubmitUnavailable')}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
