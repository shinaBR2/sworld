import { graphql } from '../../graphql';
import type {
  ListenHomeQuery,
  ListenPublicHomeQuery,
} from '../../graphql/graphql';
import { useRequest } from '../../universal/hooks/use-request';

// The listen home page fetches everything it needs in ONE Hasura request:
// the audios that feed the player, the feeling tags for the chips, and the
// user's playlists for the collection select. One page = one query.
const homeQuery = graphql(`
  query ListenHome @cached {
    audios {
      id
      name
      source
      thumbnailUrl
      artistName
      audio_tags {
        tag_id
      }
    }
    tags(where: { site: { _eq: "listen" } }) {
      id
      name
    }
    playlist(
      where: { site: { _eq: "listen" } }
      order_by: { createdAt: desc }
    ) {
      id
      title
      slug
    }
  }
`);

// Anonymous home: the same screen, but only public audios and their feelings —
// no playlists (anonymous users have none). Still one query for the page.
const publicHomeQuery = graphql(`
  query ListenPublicHome @cached {
    audios(where: { public: { _eq: true } }) {
      id
      name
      source
      thumbnailUrl
      artistName
      audio_tags {
        tag_id
      }
    }
    tags(
      where: {
        site: { _eq: "listen" }
        audio_tags: { audio: { public: { _eq: true } } }
      }
    ) {
      id
      name
    }
  }
`);

type RawHomeAudio =
  | ListenHomeQuery['audios'][number]
  | ListenPublicHomeQuery['audios'][number];

// Transformer — the single gate between Hasura and the home screen. Shapes each
// audio into the player-ready item the UI consumes (carrying its feeling tag
// ids for the filter), so the frontend never touches the raw query shape.
const transformAudio = (audio: RawHomeAudio) => ({
  id: audio.id,
  name: audio.name,
  source: audio.source,
  thumbnailUrl: audio.thumbnailUrl || '',
  artistName: audio.artistName,
  audio_tags: audio.audio_tags ?? [],
});

interface LoadHomeProps {
  getAccessToken: () => Promise<string>;
}

const useLoadHome = (props: LoadHomeProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<ListenHomeQuery>({
    queryKey: ['listen-home'],
    getAccessToken,
    document: homeQuery,
  });

  return {
    audios: data ? data.audios.map(transformAudio) : [],
    feelings: data?.tags ?? [],
    playlists: data?.playlist ?? [],
    isLoading,
    error,
  };
};

const useLoadPublicHome = () => {
  const { data, isLoading, error } = useRequest<ListenPublicHomeQuery>({
    queryKey: ['listen-public-home'],
    document: publicHomeQuery,
  });

  return {
    audios: data ? data.audios.map(transformAudio) : [],
    feelings: data?.tags ?? [],
    playlists: [],
    isLoading,
    error,
  };
};

export { useLoadHome, useLoadPublicHome };
