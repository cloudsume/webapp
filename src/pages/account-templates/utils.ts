export function isWebsiteValid(v: string): boolean {
  // parse url
  let url;

  try {
    url = new URL(v);
  } catch (e) {
    return false;
  }

  // check protocol
  for (const proto of ['http:', 'https:']) {
    if (url.protocol.localeCompare(proto, 'en', { sensitivity: 'accent' }) === 0) {
      return true;
    }
  }

  return false;
}
