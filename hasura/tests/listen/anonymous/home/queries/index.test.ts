import { expect } from "vitest";
import { GraphQLClient } from "graphql-request";
import { describe, test, expect } from "vitest";

const client = new GraphQLClient(
  `${process.env.HASURA_GRAPHQL_ENDPOINT}/v1/graphql`
);

const forbiddenQueries = [
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

describe("Home queries", () => {
  describe("allowed queries", () => {
    test.each(allowedQueries)("$name is allowed", async ({ query }) => {
      const response = await client.request(query);

      if (typeof additionalTest !== "undefined") {
        additionalTest(response);
      }
    });
  });

  describe("empty response queries", () => {
    test.each(emptyResponseQueries)(
      "$name return empty",
      async ({ query, key }) => {
        const response = await client.request(query);
        expect(response[key]).toEqual([]);
      }
    );
  });

  describe("forbidden queries", () => {
    test.each(forbiddenQueries)("$name is NOT allowed", async ({ query }) => {
      await expect(client.request(query)).rejects.toThrow();
    });
  });
});
