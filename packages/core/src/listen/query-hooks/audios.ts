import { useRequest } from '../../universal/hooks/use-request';

const audiosAndFeelingsQuery = `
  query GetAudiosAndFeelings @cached {
    audios {
      id
      name
      source
      thumbnailUrl
      public
      artistName
      createdAt
      audio_tags {
        tag_id
      }
    }
    tags(where: { site: { _eq: "listen" } }) {
      id
      name
    }
  }
`;

const publicAudiosAndFeelingsQuery = `
  query GetPublicAudiosAndFeelings @cached {
    audios(where: {public: {_eq: true}}) {
      id
      name
      source
      thumbnailUrl
      public
      artistName
      createdAt
      audio_tags {
        tag_id
      }
    }
    tags(where: { site: { _eq: "listen" } }) {
      id
      name
    }
  }
`;

interface LoadAudiosProps {
  getAccessToken: () => Promise<string>;
}

const useLoadAudios = (props: LoadAudiosProps) => {
  const { getAccessToken } = props;

  const rs = useRequest({
    queryKey: ['audios-and-feelings'],
    getAccessToken,
    document: audiosAndFeelingsQuery,
  });

  return rs;
};

const useLoadPublicAudios = () => {
  const rs = useRequest({
    queryKey: ['public-audios-and-feelings'],
    document: publicAudiosAndFeelingsQuery,
  });

  return rs;
};

export { useLoadAudios, useLoadPublicAudios };
