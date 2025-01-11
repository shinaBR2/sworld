import { ValidatedRequest } from "src/utils/validator";
import { verifySignature } from "./validator";
import { AppError } from "src/utils/schema";
import { convertVideo } from "./handler";

interface ConvertData {
  id: string;
  video_url: string;
}

interface ConvertRequest {
  data: ConvertData;
  contentTypeHeader: string;
  signatureHeader: string;
}

const extractVideoData = (data: ConvertData) => {
  const { id, video_url: videoUrl } = data;
  return { id, videoUrl };
};

const convert = async (request: ValidatedRequest<ConvertRequest>) => {
  const { validatedData } = request;
  const { signatureHeader, data } = validatedData;

  if (!verifySignature(signatureHeader)) {
    throw AppError("Invalid signature");
  }

  let video;
  try {
    video = await convertVideo(extractVideoData(data));
  } catch (error) {
    throw AppError("Failed to convert");
  }

  return video;
};

export { ConvertRequest, convert };
