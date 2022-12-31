import pw from "a-promise-wrapper";
import { CallableContext } from "firebase-functions/v1/https";
import { onCall, onRequest } from "../../singleton";
import { dbBatchWrite, dbGetRef, dbRead } from "../../singleton/db";
import { AppError, onAdminCall } from "../../singleton/request";
import { saveHomepageAudios, saveHomepageFeelings } from "./helpers";

const saveAudios = async (data: any) => {
  const { audios } = data;

  const { error } = await pw(saveHomepageAudios(data));

  if (error) {
    console.log(error);
    throw AppError("Can not save homepage audios");
  }

  return "Success";
};

const saveFeelings = async (data: any) => {
  const { feelings } = data;

  const { error } = await pw(saveHomepageFeelings(data));

  if (error) {
    console.log(error);
    throw AppError("Can not save homepage feelings");
  }

  return "Success";
};

const withRequest = {
  saveAudios: onAdminCall(saveAudios),
  saveFeelings: onAdminCall(saveFeelings),
};

export default withRequest;
