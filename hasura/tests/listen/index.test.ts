import { expect } from "vitest";
import {
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
  createRoleTestSuite,
} from "../create-role-test-suite";

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

const anonymousAllowedQueries: QueryTestCase[] = [
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
    additionalTest: async (response, roleName) => {
      const audios = response.audios;

      const isAllPublic = audios.every((audio) => audio.public);

      if (roleName === ROLE_ANONYMOUS) {
        expect(isAllPublic).toBe(true);
      }

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

await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: anonymousAllowedQueries,
    denied: [
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
      {
        name: "users",
        query: `
          query MyQuery {
            users {
              username
            }
          }
        `,
      },
    ],
    empty: emptyResponseQueries,
  },
  mutations: {
    allowed: [],
    denied: [],
  },
});

await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: [
      ...anonymousAllowedQueries,
      {
        name: "users",
        query: `
          query MyQuery {
            users {
              username
            }
          }
        `,
        additionalTest: (response) => {
          const users = response.users;
          expect(users).toBeDefined();
          expect(users.length).toBe(1);
          const user = users[0];

          expect(typeof user.username).toBe("string");
        },
      },
    ],
    denied: userDeniedQueries,
    empty: emptyResponseQueries,
  },
  mutations: {
    allowed: [],
    denied: [],
  },
});
