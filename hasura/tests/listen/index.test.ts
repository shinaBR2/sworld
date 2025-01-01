import { expect } from "vitest";
import { createRoleTestSuite } from "../create-role-test-suite";

const userDeniedQueries = [
  {
    name: "tags aggregate",
    query: `
      query MyQuery {
        tags_aggregate {
          aggregate {
            count
          }
        }
      }
    `,
  },
  {
    name: "audio tags aggregate",
    query: `
      query MyQuery {
        audio_tags_aggregate {
          aggregate {
            count
          }
        }
      }
    `,
  },
  {
    name: "users",
    query: `
      query MyQuery {
        users {
          id
          email
        }
      }
    `,
  },
  {
    name: "users aggregate",
    query: `
      query MyQuery {
        users_aggregate {
          aggregate {
            count
          }
        }
      }
    `,
  },
];

const allowedQueries = [
  {
    name: "audios",
    query: `
      query MyQuery {
        audios {
          thumbnailUrl
          artistName
          source
          name
          public
        }
      }
    `,
    additionalTest: async (response) => {
      const audios = response.audios;
      const isAllPublic = audios.every((audio) => audio.public);
      expect(isAllPublic).toBe(true);

      const hasSource = audios.every(
        (audio) => typeof audio.source === "string"
      );
      const hasName = audios.every((audio) => typeof audio.name === "string");
      const hasArtistName = audios.every(
        (audio) => typeof audio.artistName === "string"
      );

      expect(hasSource).toBe(true);
      expect(hasName).toBe(true);
      expect(hasArtistName).toBe(true);
    },
  },
  {
    name: "audio tags",
    query: `
      query MyQuery {
        audio_tags {
          audio_id
          tag_id
        }
      }
    `,
    additionalTest: (response) => {
      const audioTags = response.audio_tags;
      expect(audioTags).toBeDefined();

      const hasAudioId = audioTags.every(
        (audioTag) => typeof audioTag.audio_id === "string"
      );
      const hasTagId = audioTags.every(
        (audioTag) => typeof audioTag.tag_id === "string"
      );
      expect(hasAudioId).toBe(true);
      expect(hasTagId).toBe(true);
    },
  },
  {
    name: "tags",
    query: `
      query MyQuery {
        tags {
          display_order
          id
          name
          site
          slug
        }
      }
    `,
    additionalTest: (response) => {
      const tags = response.tags;
      expect(tags).toBeDefined();

      const isAllListenSite = tags.every((tag) => tag.site === "listen");
      expect(isAllListenSite).toBe(true);

      const hasDisplayOrder = tags.every(
        (tag) => typeof tag.display_order === "number"
      );
      const hasId = tags.every((tag) => typeof tag.id === "string");
      const hasName = tags.every((tag) => typeof tag.name === "string");
      const hasSlug = tags.every((tag) => typeof tag.slug === "string");
      expect(hasDisplayOrder).toBe(true);
      expect(hasId).toBe(true);
      expect(hasName).toBe(true);
      expect(hasSlug).toBe(true);
    },
  },
];

const emptyResponseQueries = [
  {
    name: "filter audios by public",
    key: "audios",
    query: `
      query audios {
        audios(where: {public: {_eq: false}}) {
          name
        }
      }
    `,
  },
  {
    name: "filter tags by another site",
    key: "tags",
    query: `
      query tags {
        tags(where: {site: {_eq: "another"}}) {
          name
        }
      }
    `,
  },
];

const anonymousDeniedMutations = [
  {
    name: "All",
    key: "audios",
    mutation: `
      mutation {
        # This is a placeholder and won't match any real schema
        # The point is to ensure ANY mutation is rejected
        __typename
      }
    `,
  },
];

const anonymousDeniedQueries = [
  ...userDeniedQueries,
  {
    name: "audio createdAt",
    query: `
      query MyQuery {
        audios {
          createdAt
        }
      }
    `,
  },
  {
    name: "audio updatedAt",
    query: `
      query MyQuery {
        audios {
          updatedAt
        }
      }
    `,
  },
];

createRoleTestSuite("Anonymous", {
  queries: {
    allowed: allowedQueries,
    denied: anonymousDeniedQueries,
    empty: emptyResponseQueries,
  },
  mutations: {
    allowed: [],
    denied: anonymousDeniedMutations,
  },
});

createRoleTestSuite("User", {
  queries: {
    allowed: allowedQueries,
    denied: userDeniedQueries,
    empty: emptyResponseQueries,
  },
  mutations: {
    allowed: [],
    denied: [],
  },
  token:
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkRiNWNWaFFiaXJCRUZJY3BwOFhESSJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsidXNlciIsImFkbWluIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS11c2VyLWlkIjoiMzBhMGYyMjMtM2RkZS00NjRjLWJjMTQtMGY3OGQ3YzRkNGEwIn0sImlzcyI6Imh0dHBzOi8vc2hpbmFicjIuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE3MTg1MjI1MTk0ODYyNjE1NTcwIiwiYXVkIjpbImh0dHBzOi8vcmVsaWV2ZWQtcGFudGhlci01OC5oYXN1cmEuYXBwL3YxL2dyYXBocWwiLCJodHRwczovL3NoaW5hYnIyLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3MzU3Mzk1NDYsImV4cCI6MTczNTgyNTk0Niwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImF6cCI6ImJyZTFXS2JoQUhIdGFheE9tMU9zSzYyUUxOMlpyOTY4In0.A7SMzJyjVORGWDXMf08g8e-w_9S2weBhv1h5gZM22BORcq8TYaGlzE5Lvs2g_4eg_AHG_F3ykzipYGlJBHsEE0yT1nIEb4Anpu4TzLGLxqvoa5ea1SD00B8caFLM0xymK5mOprLoUAgKd71otAK0pe5zeM7c4kK8z4NP08ab-S5Bx5ZEQKKj3ZDU-Z41K9jgcJT_Lxj_EGNlO7dXWhFxywMIi0DKpMuAeILwr06iELwDluk4stme1oEP-xMU_R2bMtB3DGhadKRVVkBEeDX-WhpDVR0LkQmsI8xbio8PSip-xOcxTuCZhuxOd0AMRPBdXpcTFVeR4Wei1lmMBplRSg",
});
