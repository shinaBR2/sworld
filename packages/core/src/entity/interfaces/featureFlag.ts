export interface FeatureFlagItem {
  isGlobal: boolean;
  allowedUserIds: string[];
  creatorId: string;
  editorId?: string;
  createdAt: Object;
  updatedAt?: Object;
}
