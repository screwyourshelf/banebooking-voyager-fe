import { createContext } from "svelte";

type CollectionContext = { readonly embedded: boolean };

const [getContext, setCollectionContext] = createContext<CollectionContext>();
export { setCollectionContext };

export function getCollectionContext(): CollectionContext | undefined {
  try {
    return getContext();
  } catch {
    return undefined;
  }
}
