function fetcher(url) {
  return fetch(url).then((r) => r.json());
}

export default fetcher;
