import { FieldValue } from "firebase/firestore";

interface BaseAudioItem {
  src: string;
  name: string;
  artistName: string;
  image: string;
}

export interface AudioItem extends BaseAudioItem {
  // id: string;
  // uploaderId: string;
  editorId?: string;
  // createdAt: FieldValue;
  updatedAt?: FieldValue;
}

export interface AudioItemInputs extends BaseAudioItem {
  uploaderId: string;
  editorId?: string;
}

export interface CreateAudioItemInputs extends BaseAudioItem {
  uploaderId: string;
}

export interface UpdateAudioItemInputs extends BaseAudioItem {
  id: string;
  editorId: string;
}
