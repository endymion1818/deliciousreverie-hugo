const siteTitle = `Delicious Reverie`;

require("dotenv").config();

const defaultPlugins = [
  `gatsby-plugin-typescript`,
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `src`,
      path: `${__dirname}/src/`,
    },
  },
  `gatsby-plugin-react-helmet`,
  `gatsby-plugin-styled-components`,
  `gatsby-plugin-twitter`,
  `gatsby-plugin-sitemap`,
  `gatsby-plugin-offline`,
  `gatsby-transformer-json`,
  `gatsby-plugin-eslint`,
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `post`,
      path: `${__dirname}/src/pages/post`,
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `page`,
      path: `${__dirname}/src/pages/`,
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `image`,
      path: `${__dirname}/src/assets/`,
    },
  },
  `gatsby-transformer-javascript-frontmatter`,
  `gatsby-plugin-sharp`,
  `gatsby-transformer-sharp`,
  `gatsby-plugin-webpack-size`,
  {
    resolve: `gatsby-plugin-react-svg`,
    options: {
      rule: {
        include: /images\/.*\.svg$/,
      },
    },
  },
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: siteTitle,
      short_name: siteTitle,
      start_url: `/`,
      background_color: `#331f33`,
      theme_color: `#f7ebc1`,
      display: `standalone`,
      icon: `src/assets/icon.png`,
    },
  },
  `gatsby-remark-copy-linked-files`,
  {
    resolve: `gatsby-remark-images`,
    options: {
      maxWidth: 1080,
    },
  },
  {
    resolve: `gatsby-plugin-sentry`,
    options: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      enabled: (() =>
        [`production`, `stage`].indexOf(process.env.NODE_ENV) !== -1)(),
    },
  },
  {
    resolve: `gatsby-plugin-feed`,
    options: {
      query: `
        {
          site {
            siteMetadata {
              title
              description
              siteUrl
              site_url: siteUrl
            }
          }
        }
      `,
      feeds: [
        {
          serialize: ({ query: { site, allMarkdownRemark } }) => {
            return allMarkdownRemark.edges.map((edge) => {
              return Object.assign({}, edge.node.frontmatter, {
                description: edge.node.excerpt,
                date: edge.node.frontmatter.date,
                url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                custom_elements: [{ "content:encoded": edge.node.html }],
              });
            });
          },
          query: `
            {
              allMarkdownRemark(
                sort: {order: DESC, fields: [frontmatter___date]}, 
                filter: {frontmatter: {type: {ne: "page"}}}) {
                edges {
                  node {
                    excerpt
                    html
                    fields { slug }
                    frontmatter {
                      title
                      date
                    }
                  }
                }
              }
            }
          `,
          output: "/feed.xml",
          title: `${siteTitle} - blog of developer and bookworm Benjamin Read`,
        },
      ],
    },
  },
  {
    resolve: `gatsby-plugin-sitemap`,
    options: {
      output: `/sitemap.xml`,
      exclude: [],
    },
  },
  {
    resolve: `gatsby-plugin-lunr`,
    options: {
      languages: [
        {
          name: "en",
        },
      ],
      fields: [
        { name: "title", store: true, attributes: { boost: 20 } },
        { name: "content" },
        { name: "url", store: true },
      ],
      resolvers: {
        MarkdownRemark: {
          title: (node) => node.frontmatter.title,
          content: (node) => node.rawMarkdownBody,
          url: (node) => node.fields.slug,
        },
      },
    },
  },
];

const jsEnabledPlugins = [
  ...defaultPlugins,
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-highlight-code`,
          options: {
            theme: "night-owl",
          },
        },
      ],
    },
  },
];

const JsDisabledPlugins = [
  ...defaultPlugins,
  `gatsby-transformer-remark`,
  `gatsby-plugin-no-javascript`,
  {
    resolve: `gatsby-plugin-no-javascript-utils`,
    options: {
      removeGeneratorTag: false,
      noInlineStyles: false,
    },
  },
];

module.exports = {
  siteMetadata: {
    pathPrefix: "/",
    title: siteTitle,
    siteUrl: `https://deliciousreverie.co.uk`,
    description: `blog of developer & bookworm benjamin read`,
  },
  plugins:
    process.env.JS_DISABLED === "true"
      ? [...JsDisabledPlugins]
      : [...jsEnabledPlugins],
};
