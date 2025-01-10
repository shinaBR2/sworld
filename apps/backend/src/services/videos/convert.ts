import { verifySignature } from "./helpers/validator";
import { convertVideo } from "./helpers/request-handler";
// @ts-ignore
import { z } from "zod";
import { AppError } from "src/utils/schema";
import { ValidatedRequest } from "src/utils/validator";

interface ConvertData {
  rows: { id: string; video_url: string }[];
}

interface ConvertRequest {
  data: ConvertData;
  contentTypeHeader: string;
  signatureHeader: string;
}

const extractVideoData = (data: ConvertData) => {
  const { id, video_url: videoUrl } = data.rows[0];
  return { id, videoUrl };
};

const VideoDataSchema = z.object({
  id: z.string(),
  video_url: z.string().url(),
});

const RecordDataSchema = z.object({
  table_id: z.string(),
  table_name: z.string(),
  rows: z.array(VideoDataSchema),
});

const ConvertSchema = z
  .object({
    body: z.object({
      type: z.string(),
      id: z.string(),
      data: RecordDataSchema,
    }),
    headers: z
      .object({
        "content-type": z.string(),
        "x-webhook-signature": z.string(),
      })
      .passthrough(), // Allow additional headers
  })
  .transform((req) => ({
    data: req.body.data,
    contentTypeHeader: req.headers["content-type"] as string,
    signatureHeader: req.headers["x-webhook-signature"] as string,
  }));

const convert = async (request: ValidatedRequest<ConvertRequest>) => {
  const { validatedData } = request;
  const { signatureHeader, data } = validatedData;

  // {
  //   body: {
  //     type: 'records.manual.trigger',
  //     id: '************************************',
  //     data: {
  //       table_id: 'mlqubpsywyac549',
  //       table_name: 'videos',
  //       rows: [Array]
  //     }
  //   },
  //   headers: {
  //     'content-type': 'application/json',
  //     'x-webhook-signature': '7a9c2b4e8f3d1a6b5c9d8e7f2a3b4c5d',
  //     host: 'pheasant-clear-marmot.ngrok-free.app',
  //     'user-agent': 'axios/1.7.9',
  //     'content-length': '824',
  //     accept: 'application/json, text/plain, */*',
  //     'accept-encoding': 'gzip, compress, deflate, br',
  //     'x-forwarded-for': '************',
  //     'x-forwarded-host': 'pheasant-clear-marmot.ngrok-free.app',
  //     'x-forwarded-proto': 'https'
  //   }
  // }

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

export { ConvertSchema, convert, ConvertRequest };
