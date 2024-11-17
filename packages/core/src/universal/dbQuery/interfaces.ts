import { Firestore, FirestoreDataConverter } from 'firebase/firestore';

export interface BaseFirestoreInputs {
  db: Firestore;
  path: string;
  pathSegments: string[];
}

export interface CollectionInputs<T> extends BaseFirestoreInputs {
  converter: FirestoreDataConverter<T>;
}

export interface AddDocInputs<T = {}> extends BaseFirestoreInputs {
  data: T;
}

export type PathConfigs = Omit<BaseFirestoreInputs, 'db'>;
