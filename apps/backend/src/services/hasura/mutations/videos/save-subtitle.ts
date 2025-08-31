import { graphql } from '../../generated-graphql';
import type {
  SaveSubtitleMutation,
  SaveSubtitleMutationVariables,
  Subtitles_Set_Input,
} from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

const SAVE_SUBTITLE = graphql(/* GraphQL */ `
  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {
    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`);

const saveSubtitle = async (id: string, input: Subtitles_Set_Input) => {
  const response = await hasuraClient.request<
    SaveSubtitleMutation,
    SaveSubtitleMutationVariables
  >({
    document: SAVE_SUBTITLE.toString(),
    variables: {
      id,
      object: input,
    },
  });

  return response.update_subtitles_by_pk;
};

export { saveSubtitle };
