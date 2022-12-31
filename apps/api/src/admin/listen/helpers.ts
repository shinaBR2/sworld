import { dbBatchWrite, dbGetRef } from "../../singleton/db";

interface InputItem {
  id: string;
  value: any;
}

interface AudiosInputs {
  audios: InputItem[];
}

interface FeelingInputs {
  feelings: InputItem[];
}

const saveHomepageAudios = async (data: AudiosInputs) => {
  const { audios } = data;
  const { start, end } = dbBatchWrite();
  const batch = start();

  /**
   * Steps:
   * - Clear all the current feelings
   * - Push all new feelings
   */
  const path = "/homeConfigs/listen/audios";
  const ref = dbGetRef(path) as FirebaseFirestore.CollectionReference;
  const allDocs = await ref.listDocuments();

  if (allDocs && allDocs.length) {
    allDocs.map((doc) => {
      const { id } = doc;

      const docPath = `${path}/${id}`;
      const ref = dbGetRef(docPath) as FirebaseFirestore.DocumentReference;
      batch.delete(ref);
    });
  }

  audios.map((doc) => {
    const { id, value } = doc;
    const { image: thumbnailUrl, ...rest } = value;

    const docPath = `${path}/${id}`;
    const ref = dbGetRef(docPath) as FirebaseFirestore.DocumentReference;
    batch.set(ref, { ...rest, thumbnailUrl });
  });

  // Commit the batch
  await end(batch);
};

const saveHomepageFeelings = async (data: FeelingInputs) => {
  const { feelings } = data;
  const { start, end } = dbBatchWrite();
  const batch = start();

  /**
   * Steps:
   * - Clear all the current feelings
   * - Push all new feelings
   */
  const path = "/homeConfigs/listen/feelings";
  const ref = dbGetRef(path) as FirebaseFirestore.CollectionReference;
  const allDocs = await ref.listDocuments();

  allDocs.map((doc) => {
    const { id } = doc;

    const docPath = `${path}/${id}`;
    const ref = dbGetRef(docPath) as FirebaseFirestore.DocumentReference;
    batch.delete(ref);
  });

  feelings.map((doc) => {
    const { id, value } = doc;

    const docPath = `${path}/${id}`;
    const ref = dbGetRef(docPath) as FirebaseFirestore.DocumentReference;
    batch.set(ref, value);
  });

  // Commit the batch
  await end(batch);
};

export { saveHomepageAudios, saveHomepageFeelings };
