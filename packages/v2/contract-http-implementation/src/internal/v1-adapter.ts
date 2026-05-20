export interface IV1WorkflowAdapter {
  activate(input: unknown): Promise<unknown>;
  create(input: unknown): Promise<unknown>;
  deactivate(input: unknown): Promise<unknown>;
  list(input: unknown): Promise<unknown>;
  update(input: unknown): Promise<unknown>;
  delete(input: unknown): Promise<unknown>;
  duplicate(input: unknown): Promise<unknown>;
  getById(input: unknown): Promise<unknown>;
  getCapabilities(input: unknown): Promise<unknown>;
  listRuns(input: unknown): Promise<unknown>;
  getRun(input: unknown): Promise<unknown>;
  testRun(input: unknown): Promise<unknown>;
}

export interface IV1ShareAdapter {
  getView(input: unknown): Promise<unknown>;
  getViewAggregations(input: unknown): Promise<unknown>;
  getViewGroupPoints(input: unknown): Promise<unknown>;
  getViewCalendarDailyCollection(input: unknown): Promise<unknown>;
  getViewLinkRecords(input: unknown): Promise<unknown>;
  getViewCollaborators(input: unknown): Promise<unknown>;
  getViewRowCount(input: unknown): Promise<unknown>;
  getViewRecords(input: unknown): Promise<unknown>;
  getViewSearchCount(input: unknown): Promise<unknown>;
  getViewSearchIndex(input: unknown): Promise<unknown>;
  buttonClickView(input: unknown): Promise<unknown>;
  copyView(input: unknown): Promise<unknown>;
  formSubmitView(input: unknown): Promise<unknown>;
}

export interface IV1SettingsAdapter {
  get(input: unknown): Promise<unknown>;
  getPublic(input: unknown): Promise<unknown>;
}

export interface IV1TemplatesAdapter {
  listPublished(input: unknown): Promise<unknown>;
  getById(input: unknown): Promise<unknown>;
  getPermalink(input: unknown): Promise<unknown>;
  incrementVisit(input: unknown): Promise<unknown>;
}

export interface IV1CommentsAdapter {
  list(input: unknown): Promise<unknown>;
  getRecordCount(input: unknown): Promise<unknown>;
  getSubscribeDetail(input: unknown): Promise<unknown>;
  subscribe(input: unknown): Promise<unknown>;
  unsubscribe(input: unknown): Promise<unknown>;
  getTableCount(input: unknown): Promise<unknown>;
  getById(input: unknown): Promise<unknown>;
}

export interface IV1PublishedAppsAdapter {
  getRuntimeManifest(input: unknown): Promise<unknown>;
  getNavigationModel(input: unknown): Promise<unknown>;
  getNodeRuntime(input: unknown): Promise<unknown>;
}

export interface IV1OrganizationAdapter {
  getMe(input: unknown): Promise<unknown>;
  getDepartmentUsers(input: unknown): Promise<unknown>;
  getDepartmentList(input: unknown): Promise<unknown>;
}

export interface IV1Adapter {
  workflows?: IV1WorkflowAdapter;
  share?: IV1ShareAdapter;
  settings?: IV1SettingsAdapter;
  templates?: IV1TemplatesAdapter;
  comments?: IV1CommentsAdapter;
  publishedApps?: IV1PublishedAppsAdapter;
  organization?: IV1OrganizationAdapter;
}
