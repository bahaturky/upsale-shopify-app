function useCollection() {
  const gid = window.meta?.page?.resourceId;
  return gid ? `gid://shopify/Collection/${gid}` : null;
}

export default useCollection;
