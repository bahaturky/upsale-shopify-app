// Only getting the first 21 every time to be sure to stay under API quota
// Didn't have complaints about it, that they could not see all their variants

export const listProducts = (ids) => `{
    nodes(ids: ${JSON.stringify(ids)}) {
      ... on Product {
        title
        handle
        id
        featuredImage {
          transformedSrc (maxWidth: 120, maxHeight:120)
        }
        variants(first: 21) {
          edges {
            node {
              id
              title
              price
              compareAtPrice
              inventoryManagement
              inventoryPolicy
              inventoryQuantity
              image {
                transformedSrc (maxWidth: 120, maxHeight:120)
              }
            }
          }
        }
      }
    }
  }`;

export const listCollections = (ids) => `{
    nodes(ids: ${JSON.stringify(ids)}) {
      ... on Collection {
        title
        handle
        id
      }
    }
  }`;

export const getProductsVariants = (ids) => `{
  nodes(ids: ${JSON.stringify(ids)}) {
    ... on Product {
      title
      handle
      id
      featuredImage {
        transformedSrc (maxWidth: 120, maxHeight:120)
      }
      variants(first: 21) {
        edges {
          node {
            id
            title
            price
            compareAtPrice
            inventoryManagement
            inventoryPolicy
            inventoryQuantity
            image {
              transformedSrc (maxWidth: 120, maxHeight:120)
            }
          }
        }
      }
    }
  }
}`;

export const getProduct = (id) =>
  JSON.stringify({
    query: `{
      product(id: ${JSON.stringify(id)}) { 
        title
        handle
        id
        description
        descriptionHtml
        productType
        featuredImage {
          transformedSrc (maxWidth: 120, maxHeight:120)
        }
        variants(first: 21) {
          edges {
            node {
              id
              displayName
              price
              image {
                transformedSrc (maxWidth: 120, maxHeight:120)
              }
            }
          }
        }
      }
  }`,
  });
