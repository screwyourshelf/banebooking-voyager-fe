import type { ComponentProps } from "react";
import {
  CollectionFrame,
  CollectionGroup,
  CollectionGroupHeading,
  CollectionList,
  CollectionRow,
} from "./CollectionParts";

type CollectionProps = ComponentProps<typeof CollectionFrame>;

function CollectionRoot(props: CollectionProps) {
  return <CollectionFrame {...props} />;
}

const Collection = Object.assign(CollectionRoot, {
  List: CollectionList,
  Group: CollectionGroup,
  GroupHeading: CollectionGroupHeading,
  Row: CollectionRow,
});

export default Collection;
