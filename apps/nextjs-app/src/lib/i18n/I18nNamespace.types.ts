import type { I18nNamespaces } from '@teable/common-i18n';

export type I18nNamespace = keyof I18nNamespaces;

/**
 * Helper to get fully typed namespaced keys
 */
export type I18nActiveNamespaces<NamespacesUnion extends I18nNamespace> = Extract<
  I18nNamespace,
  NamespacesUnion
>[];
