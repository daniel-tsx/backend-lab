/** Find a slug like `base`, `base-2`, `base-3`… that passes the `exists` check. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = base.length > 0 ? base : 'item';
  let slug = root;
  let n = 2;
  while (await exists(slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}
