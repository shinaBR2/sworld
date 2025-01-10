import * as os from "os";
import { stat, unlink } from "fs";
import { mkdir } from "fs/promises";
import { rm } from "fs/promises";
import { promisify } from "util";
import path from "path";
import {
  generateTempDirName,
  downloadFile,
  uploadDirectory,
  getDownloadUrl,
} from "./file-helpers";

// https://stackoverflow.com/questions/45555960/nodejs-fluent-ffmpeg-cannot-find-ffmpeg
//@ts-ignore
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
export interface ConversionVideo {
  id: string;
  videoUrl: string;
}

const cleanupWorkingDirectory = async (workingDir: string) => {
  try {
    // await fs.remove(workingDir);
    await rm(workingDir, { recursive: true, force: true });
  } catch (error) {
    // Log the error but don't throw it - cleanup failures shouldn't break the main flow
    console.error("Cleanup failed:", error);
  }
};

const handleConvertVideo = async (data: ConversionVideo) => {
  const { id, videoUrl } = data;

  // Generate unique working directory name
  const uniqueDir = generateTempDirName();
  const workingDir = path.join(os.tmpdir(), uniqueDir);
  const outputDir = path.join(workingDir, "output");

  try {
    // await ensureDir(workingDir);
    await mkdir(workingDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });
    // await ensureDir(outputDir);

    const inputPath = path.join(workingDir, "input.mp4");
    await downloadFile(videoUrl, inputPath);

    // Check file size after download
    // const stats = await stat(inputPath);
    const statAsync = promisify(stat);
    const stats = await statAsync(inputPath);
    if (stats.size > 400 * 1024 * 1024) {
      // 400MB
      throw new Error("Downloaded file too large for processing");
    }

    // Generate a clean storage path
    const outputPath = `videos/${id}`;
    const cleanOutputPath = path
      .normalize(outputPath)
      .replace(/^\/+|\/+$/g, "");

    // Convert to HLS
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-codec copy",
          "-start_number 0",
          "-hls_time 10",
          "-hls_list_size 0",
          "-f hls",
        ])
        .output(path.join(outputDir, "playlist.m3u8"))
        .on("end", () => resolve())
        .on("error", (err: any) => reject(err))
        .run();
    });

    await uploadDirectory(outputDir, cleanOutputPath);

    await cleanupWorkingDirectory(workingDir);

    const playlistUrl = getDownloadUrl(cleanOutputPath);

    return playlistUrl;
  } catch (error) {
    await cleanupWorkingDirectory(workingDir);

    if (error instanceof Error) {
      console.error("Video conversion error:", error);
      throw new Error(error.message);
    } else {
      console.error("Unknown error during video conversion:", error);
      throw new Error("Unknown error during video conversion");
    }
  }
};

/**
 * Screenshot video to thumnail and return local thumbnail file path
 * videoPath should be RELATIVE local file path
 *
 * @param videoPath string
 * @returns
 */
const generateThumbnail = async (videoPath: string): Promise<string> => {
  const absoluteVideoPath = path.resolve(videoPath);
  const outputDir = path.dirname(absoluteVideoPath);
  const outputFilename = `thumb_${Date.now()}.jpg`;
  const thumbnailPath = path.join(outputDir, outputFilename);

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(absoluteVideoPath)
        .screenshot({
          timestamps: ["00:03:00"],
          folder: outputDir, // Specify the output folder
          filename: outputFilename, // Just the filename, not the full path
        })
        .on("start", (cmd) => {
          console.log("FFmpeg command:", cmd);
        })
        .on("end", resolve)
        .on("error", (err, stdout, stderr) => {
          console.error("FFmpeg stdout:", stdout);
          console.error("FFmpeg stderr:", stderr);
          reject(new Error(`FFmpeg error: ${err.message}`));
        });
    });

    return thumbnailPath;
  } catch (error) {
    try {
      const unlinkAsync = promisify(unlink);
      unlinkAsync(thumbnailPath).catch(console.error);
    } catch (e) {
      // File doesn't exist or can't be accessed, ignore
    }

    throw error;
  }
};

export { handleConvertVideo, generateThumbnail };
