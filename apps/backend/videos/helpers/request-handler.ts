// @ts-ignore
import { saveVideoSource } from 'database';
import { ConversionVideo, handleConvertVideo } from './ffmpeg-helpers';

const postConvert = async (data: { id: string; videoUrl: string }) => {
  const { id, videoUrl } = data;
  const video = await saveVideoSource(id, videoUrl);

  console.log(`updated video`, video);
  return video;
};

export const convertVideo = async (inputData: ConversionVideo) => {
  let videoUrl;
  try {
    videoUrl = await handleConvertVideo(inputData);
  } catch (error) {
    throw new Error((error as unknown as Error).message);
  }

  console.log(`Converted video, now update database`);

  let video;
  try {
    video = await postConvert({
      ...inputData,
      videoUrl,
    });
  } catch (error) {
    throw new Error((error as unknown as Error).message);
  }

  console.log(`Saved into database`);

  return video;
};
