import { graphql } from '../../graphql';
import type { ListenHomeQuery } from '../../graphql/graphql';
import { useAuthContext } from '../../providers/auth';
import { useRequest } from '../../universal/hooks/use-request';

// The listen home page fetches everything it needs in ONE Hasura request:
// the audios that feed the player, the feeling tags for the chips, and the
// playlists for the collection select. One page = one query.
//
// The query is role-agnostic — no `public` filter in here. Hasura's row
// permissions decide the rows each role may see (the user's own audios and
// playlists when signed in, the public ones for the anonymous role), so
// authorization stays on the server, never encoded in the frontend query.
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

// Transformer — the single gate between Hasura and the home screen. Shapes each
// audio into the player-ready item the UI consumes (carrying its feeling tag
// ids for the filter), so the frontend never touches the raw query shape.
const transformAudio = (audio: ListenHomeQuery['audios'][number]) => ({
  id: audio.id,
  name: audio.name,
  source: audio.source,
  thumbnailUrl: audio.thumbnailUrl || '',
  artistName: audio.artistName,
  audio_tags: audio.audio_tags ?? [],
});

// Role-agnostic: attach the token when signed in, omit it for anonymous so
// Hasura runs as the `anonymous` role. The role is part of the query key so
// the two role views never share a cache entry.
const useLoadHome = () => {
  const { isSignedIn, getAccessToken } = useAuthContext();

  const { data, isLoading, error } = useRequest<ListenHomeQuery>({
    queryKey: ['listen-home', isSignedIn],
    getAccessToken: isSignedIn ? getAccessToken : undefined,
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

export { useLoadHome };
