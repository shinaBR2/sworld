import db, { getTimeStamp, onRequest } from "../singleton";

import { commonHelpers } from "core";

const { compareString } = commonHelpers;

const checkRead = onRequest(async (req, res) => {
  const snapshot = await db.collection("feelings").get();
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
  });

  console.log(`Compare string str1 and str2: ${compareString("str1", "str2")}`);

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
