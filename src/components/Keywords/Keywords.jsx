import React, { KeyboardEvent } from "react";
import { useFormContext, Controller } from "react-hook-form";


const Keyword = ({ title, field_prefix }) => {
  const { control, setValue, watch } = useFormContext();
  const tagsString= watch(`${field_prefix}_tags`) || ""; // Watch for the registered field
  const tags = tagsString != 'undefined' ? tagsString.split(",").map((tag) => tag.trim()).filter(Boolean) : []; // Parse the string into an array

  const handleKeyDown = (
    e,
    onChange
  ) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      const newTag = e.currentTarget.value.trim();
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        onChange(updatedTags.join(","));
      }
      e.currentTarget.value = ""; // Clear input
      e.preventDefault();
    } else if (e.key === "Backspace" && e.currentTarget.value === "" && tags.length) {
      const lastTag = tags[tags.length - 1];
      e.currentTarget.value = lastTag;
      const updatedTags = tags.slice(0, -1);
      onChange(updatedTags.join(","));
    }
  };

  const removeTag = (indexToRemove, onChange) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(updatedTags.join(","));
  };

  return (
    <div className="mb-4 flex items-start flex-col md:flex-row">
      {title && (
        <h1 className="text-xs font-semibold mb-2 w-full md:w-1/5">{title}</h1>
      )}
      <div className="w-full md:w-4/5 flex items-center flex-wrap border p-2 gap-2 bg-white rounded">
        <Controller
          name={`${field_prefix}_tags`}
          control={control}
          render={({ field }) => (
            <>
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center text-gray-700 border rounded-full px-3 py-1"
                >
                  <span>{tag}</span>
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    onClick={() => removeTag(index, field.onChange)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Add a keyword"
                className="flex-grow border py-1 px-2 rounded-full outline-none"
                onKeyDown={(e) => handleKeyDown(e, field.onChange)}
              />
            </>
          )}
        />
      </div>
    </div>

    
  );
};

export default Keyword;
