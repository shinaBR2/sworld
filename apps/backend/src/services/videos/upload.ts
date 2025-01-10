import * as os from "os";
import { AppError } from "src/utils/schema";
import { ValidatedRequest } from "src/utils/validator";
import { downloadFile, generateTempDirName } from "./helpers/file-helpers";
import { generateThumbnail } from "./helpers/ffmpeg-helpers";
import { uploadFromLocalFilePath } from "./helpers/cloudinary";
import path from "path";
import { mkdir, rm } from "fs/promises";

interface UploadRequest {
  data: any;
}

/**
 *
 * @param request
 * @returns
 */
const upload = async (request: ValidatedRequest<UploadRequest>) => {
  const { validatedData } = request.body;
  const { data } = validatedData;
  const { videoUrl } = data;

  // TODO move to file helper
  const uniqueDir = generateTempDirName();
  const workingDir = path.join(os.tmpdir(), uniqueDir);
  const local_file_path = path.join(workingDir, "input.mp4");

  await mkdir(workingDir, { recursive: true });

  // Download video
  await downloadFile(videoUrl, local_file_path);

  // Now file is at local_file_path
  const localThumbnailUrl = await generateThumbnail(local_file_path);

  // Upload to Cloudinary, public URL
  const uploadedUrl = await uploadFromLocalFilePath(localThumbnailUrl, {
    // some options
  });

  return uploadedUrl;
};

export { upload };
