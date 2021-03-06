const path = require(`path`);
const _ = require(`lodash`);
const { paginate } = require(`gatsby-awesome-pagination`);

const { createFilePath } = require(`gatsby-source-filesystem`);

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  const blogPostTemplate = path.resolve(`./src/components/Templates/Post.tsx`);
  const categoryTemplate = path.resolve(
    `./src/components/Templates/Category.tsx`
  );
  const tagTemplate = path.resolve(`./src/components/Templates/Tag.tsx`);
  const archiveTemplate = path.resolve(
    `./src/components/Templates/Archive.tsx`
  );

  return graphql(
    `
      {
        allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                categories
                tags
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors;
    }

    // Create blog posts pages.
    const posts = result.data.allMarkdownRemark.edges;

    posts.forEach((post, index) => {
      const previous =
        index === posts.length - 1 ? null : posts[index + 1].node;
      const next = index === 0 ? null : posts[index - 1].node;
      createPage({
        path: post.node.fields.slug,
        component: blogPostTemplate,
        context: {
          slug: post.node.fields.slug,
          previous,
          next
        }
      });
    });
    // archive pages
    paginate({
      createPage,
      items: posts,
      itemsPerPage: 10,
      pathPrefix: "/",
      component: archiveTemplate
    });
    // taxonomy pages
    let categories = [];
    _.each(posts, edge => {
      if (_.get(edge, `node.frontmatter.categories`)) {
        categories = categories.concat(edge.node.frontmatter.categories);
      }
    });
    categories = _.uniq(categories);
    categories.forEach(category => {
      createPage({
        path: `/categories/${category.toLowerCase().replace(/ /g, "-")}/`,
        component: categoryTemplate,
        context: {
          category
        }
      });
    });

    let tags = [];
    _.each(posts, edge => {
      if (_.get(edge, `node.frontmatter.tags`)) {
        tags = tags.concat(edge.node.frontmatter.tags);
      }
    });
    tags = _.uniq(tags);
    tags.forEach(tag => {
      createPage({
        path: `/tags/${tag.toLowerCase().replace(/ /g, "-")}/`,
        component: tagTemplate,
        context: {
          tag
        }
      });
    });
    return null;
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` });
    createNodeField({
      name: `slug`,
      node,
      value: slug
    });
  }
};
