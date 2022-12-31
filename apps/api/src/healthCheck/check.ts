import db, { getTimeStamp, onRequest } from "../singleton";

// import { commonHelpers } from "core";
import { dbRead } from "../singleton/db";

const checkRead = onRequest(async (req, res) => {
  const snapshot = (await dbRead(
    "feelings"
  )) as FirebaseFirestore.QuerySnapshot;
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
  });

  res.send("Success");
});

const checkWrite = onRequest(async (req, res) => {
  const ref = db.collection("tmp").doc("checkWrite");

  await ref.update({
    healCheck: true,
    timestamp: getTimeStamp(),
  });

  res.send("Success");
});

export { checkRead, checkWrite };
