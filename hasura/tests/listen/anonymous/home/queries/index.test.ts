import { expect } from "vitest";
import { GraphQLClient } from "graphql-request";
import { describe, test, expect } from "vitest";

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
    additionalTest: (response) => {
      const audios = response.audios;
      const isAllPublic = audios.every((audio) => audio.public);
      expect(isAllPublic).toBe(true);
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
  const client = new GraphQLClient(
    `${process.env.HASURA_GRAPHQL_ENDPOINT}/v1/graphql`
  );

  describe("allowed queries", () => {
    test.each(allowedQueries)("$name is allowed", async ({ query }) => {
      await expect(client.request(query)).resolves.not.toThrow();
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
