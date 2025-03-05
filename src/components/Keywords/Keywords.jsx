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
    <div className="">
      <div className="w-full md:w-4/5">
        <Controller
          name={`${field_prefix}_tags`}
          control={control}
          render={({ field }) => (
            <div className="flex">
              <div className="flex flex-wrap">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center text-gray-700 border px-3 py-1"
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
              </div>
              <input
                type="text"
                placeholder="Add a column name"
                className="flex-grow border px-2 outline-none"
                onKeyDown={(e) => handleKeyDown(e, field.onChange)}
              />
            </div>
          )}
        />
      </div>
    </div>

    
  );
};

export default Keyword;
