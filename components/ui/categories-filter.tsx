"use client";

import CustomButton from "../custom-button";
import SelectBox from "./select-box";

function CategoriesFilter() {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col flex-1 gap-2">
        <label htmlFor="category">Category</label>
        <SelectBox
          label="Category"
          id="category"
          options={["All", "Category 1", "Category 2", "Category 3"]}
          onChange={() => {}}
          selectedOption="All"
        />
        <CustomButton
          className="mt-2"
          onClick={async () => {
            console.log("clicked");
          }}
        >
          Search
        </CustomButton>
      </div>
      <div className="flex flex-col flex-1 gap-2">
        <label htmlFor="subcategory">Sub Category</label>
        <SelectBox
          label="Sub Category"
          id="subcategory"
          options={[
            "All",
            "Sub Category 1",
            "Sub Category 2",
            "Sub Category 3",
          ]}
          onChange={() => {}}
          selectedOption="All"
        />
      </div>
    </div>
  );
}

export default CategoriesFilter;
