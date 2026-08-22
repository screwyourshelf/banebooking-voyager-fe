export function createTenantQueryKey<const TScope extends string>(scope: TScope, slug: string) {
  return [scope, { slug }] as const;
}
