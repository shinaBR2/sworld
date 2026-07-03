import { type FragmentType, getFragmentData } from '../../graphql';
import { AudioFragment } from './fragments';

const transformAudioFragment = (
  audioData: FragmentType<typeof AudioFragment>,
) => {
  const audio = getFragmentData(AudioFragment, audioData);

  return {
    id: audio.id,
    name: audio.name,
    source: audio.source,
    thumbnailUrl: audio.thumbnailUrl || '',
    artistName: audio.artistName,
  };
};

export { transformAudioFragment };
