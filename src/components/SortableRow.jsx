import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const enhancedChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, { listeners, attributes })
  );

  return (
    <tr ref={setNodeRef} style={style}>
      {enhancedChildren}
    </tr>
  );
};

export default SortableRow;
