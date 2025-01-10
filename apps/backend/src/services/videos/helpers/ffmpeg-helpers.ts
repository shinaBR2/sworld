import * as os from "os";
import * as path from "path";
//@ts-ignore
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import {
  generateTempDirName,
  downloadFile,
  uploadDirectory,
  getDownloadUrl,
  createDirectory,
  cleanupDirectory,
  verifyFileSize,
} from "./file-helpers";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface ConversionVideo {
  id: string;
  videoUrl: string;
}

/**
 * Converts video to HLS format using ffmpeg
 */
const convertToHLS = async (
  inputPath: string,
  outputDir: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-codec copy",
        "-start_number 0",
        "-hls_time 10",
        "-hls_list_size 0",
        "-f hls",
      ])
      .output(path.join(outputDir, "playlist.m3u8"))
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
};

/**
 * Screenshot video to thumbnail at specified timestamp
 */
const takeScreenshot = async (
  videoPath: string,
  outputDir: string,
  filename: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshot({
        timestamps: ["00:00:03"], // Using earlier timestamp for better performance
        folder: outputDir,
        filename: filename,
      })
      .on("end", resolve)
      .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg stdout:", stdout);
        console.error("FFmpeg stderr:", stderr);
        reject(new Error(`FFmpeg error: ${err.message}`));
      });
  });
};

const handleConvertVideo = async (data: ConversionVideo) => {
  const { id, videoUrl } = data;
  const uniqueDir = generateTempDirName();
  const workingDir = path.join(os.tmpdir(), uniqueDir);
  const outputDir = path.join(workingDir, "output");

  try {
    await createDirectory(workingDir);
    await createDirectory(outputDir);

    const inputPath = path.join(workingDir, "input.mp4");
    await downloadFile(videoUrl, inputPath);
    await verifyFileSize(inputPath, 400 * 1024 * 1024); // 400MB limit

    const outputPath = path.normalize(`videos/${id}`).replace(/^\/+|\/+$/g, "");

    await convertToHLS(inputPath, outputDir);
    await uploadDirectory(outputDir, outputPath);
    await cleanupDirectory(workingDir);

    return getDownloadUrl(outputPath);
  } catch (error) {
    await cleanupDirectory(workingDir);
    if (error instanceof Error) {
      console.error("Video conversion error:", error);
      throw new Error(error.message);
    }
    console.error("Unknown error during video conversion:", error);
    throw new Error("Unknown error during video conversion");
  }
};

const generateThumbnail = async (videoPath: string): Promise<string> => {
  const absoluteVideoPath = path.resolve(videoPath);
  const outputDir = path.dirname(absoluteVideoPath);
  const outputFilename = `thumb_${Date.now()}.jpg`;
  const thumbnailPath = path.join(outputDir, outputFilename);

  try {
    await takeScreenshot(absoluteVideoPath, outputDir, outputFilename);
    return thumbnailPath;
  } catch (error) {
    await cleanupDirectory(thumbnailPath);
    throw error;
  }
};

export { handleConvertVideo, generateThumbnail };
