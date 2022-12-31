interface BaseFeeling {
  name: string;
  value: string;
  creatorId: string;
  editorId?: string;
  createdAt: Object;
  updatedAt?: Object;
}

export interface Feeling extends BaseFeeling {
  id: string;
}
