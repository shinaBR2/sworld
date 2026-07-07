import { graphql } from '../../graphql';
import type { ListenManageQuery } from '../../graphql/graphql';
import { useAuthContext } from '../../providers/auth';
import { useRequest } from '../../universal/hooks/use-request';

// The listen management dashboard (SWO-411) fetches everything it needs in ONE
// Hasura request: the user's own audios (with their feeling tag ids), the
// listen feeling vocabulary to assign from, and the user's own playlists.
// One page = one query = one transformer; this does not reuse the home query.
//
// It is a signed-in, user-only screen, scoped to the caller's own content via
// their user id (audios/playlist are filtered by user_id — the `audios.user_id`
// column was exposed to the user role for exactly this). Hasura row permissions
// still enforce ownership on the server; the filter just narrows the view to
// what the user can manage.
const manageQuery = graphql(`
  query ListenManage($userId: uuid!) {
    audios(
      where: { user_id: { _eq: $userId } }
      order_by: { createdAt: desc }
    ) {
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
      where: { site: { _eq: "listen" } }
      order_by: { display_order: asc }
    ) {
      id
      name
    }
    playlist(
      where: { user_id: { _eq: $userId }, site: { _eq: "listen" } }
      order_by: { createdAt: desc }
    ) {
      id
      title
      slug
      description
      thumbnailUrl
    }
  }
`);

// Transformer — the single gate between Hasura and the manage screen. Flattens
// each audio's feeling join into a plain tag-id list the UI edits directly.
const transformAudio = (audio: ListenManageQuery['audios'][number]) => ({
  id: audio.id,
  name: audio.name,
  artistName: audio.artistName,
  thumbnailUrl: audio.thumbnailUrl || '',
  source: audio.source,
  tagIds: (audio.audio_tags ?? []).map((t) => t.tag_id),
});

// User-only: always attach the token. The query key is the bare ['listen-manage']
// (no user-id segment) so the audio/playlist mutation hooks can invalidate it by
// exact match — the query provider's invalidateQuery uses exact:true.
const useLoadManage = () => {
  const { user, getAccessToken } = useAuthContext();
  const userId = user?.id ?? '';

  const { data, isLoading, error } = useRequest<
    ListenManageQuery,
    { userId: string }
  >({
    queryKey: ['listen-manage'],
    getAccessToken,
    document: manageQuery,
    variables: { userId },
    enabled: Boolean(userId),
  });

  return {
    audios: data ? data.audios.map(transformAudio) : [],
    feelings: data?.tags ?? [],
    playlists: data?.playlist ?? [],
    isLoading,
    error,
  };
};

export { useLoadManage };
