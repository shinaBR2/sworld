import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();

const db = getFirestore();

const sanitizePath = (str: string) => {
  if (str[0] !== '/') {
    return `/${str}`;
  }

  return str;
};

const isCollection = (pathStr: string) => {
  const p = pathStr.split('/');
  return p.length % 2 === 0;
};

const dbGetRef = (pathStr: string) => {
  const p = sanitizePath(pathStr);

  if (isCollection(p)) {
    return db.collection(p);
  }

  return db.doc(p);
};

const dbRead = async (pathStr: string) => {
  const p = sanitizePath(pathStr);

  const ref = dbGetRef(p);

  return await ref.get();
};

const dbAddDoc = async (
  pathStr: string,
  data: FirebaseFirestore.DocumentData
) => {
  const p = sanitizePath(pathStr);
  const res = await db.collection(p).add(data);

  return { id: res.id };
};

const dbAddDocWithId = async (
  pathStr: string,
  id: string,
  data: FirebaseFirestore.DocumentData
) => {
  const p = sanitizePath(pathStr);
  const res = await db.collection(p).doc(id).set(data);

  return res;
};

const dbUpdateDoc = async (
  pathStr: string,
  data: FirebaseFirestore.DocumentData
) => {
  const p = sanitizePath(pathStr);
  const res = await db.doc(p).update(data);

  return res;
};

const deleteDoc = async (pathStr: string) => {
  const p = sanitizePath(pathStr);
  const res = await db.doc(p).delete();

  return res;
};

const dbBatchWrite = () => {
  const start = () => {
    const batch = db.batch();

    return batch;
  };

  const end = async (batch: FirebaseFirestore.WriteBatch) => {
    await batch.commit();
  };

  return {
    start,
    end,
  };
};

export {
  dbGetRef,
  dbRead,
  dbAddDoc,
  dbAddDocWithId,
  dbUpdateDoc,
  deleteDoc,
  dbBatchWrite,
};

export default db;
