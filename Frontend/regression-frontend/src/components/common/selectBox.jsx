import { FormControl, MenuItem, Select } from "@mui/material";
import React, { useRef } from "react";

export const SelectBox = ({
  value = "",
  borderless = false,
  handleChange = () => false,
  menuList = [],
  background = "#1D5BBF0D",
  borderColor = "#003882",
  height = "40px",
  color = "#000",
  width = "100%",
  placeholder = "Select",
  disabled = false,
  name=""
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = useRef(null);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (selectRef.current) {
      if (!isOpen) {
        selectRef.current.focus();
      } else {
        selectRef.current.blur();
      }
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <FormControl fullWidth autoComplete="off">
        <Select
          name={name}
          autoComplete={`disabled-autofill-${name}`}
          disabled={disabled}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <span className="text-[16px] text-black">
                  {placeholder}
                </span>
              );
            }

            const selectedItem = menuList.find(
              (item) => item.value === selected
            );
            return selectedItem ? selectedItem.label : selected;
          }}
          fullWidth={!width ? true : false}
          value={value}
          onChange={handleChange}
          sx={{
            height: height ?? "40px",
            color: color ?? "#000",
            ...(width && { width }),
            background: background ?? "#FE634E",

            // Root border conditionally applied
            ...(borderless
              ? {
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&.MuiOutlinedInput-root": {
                    border: "none",
                  },
                }
              : {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: borderColor ?? "#FE634E",
                  },
                  "&.MuiOutlinedInput-root": {
                    borderColor: borderColor ?? "#FE634E",
                  },
                }),

            "& .MuiSelect-select": {
              fontSize: "14px",
              padding: "8px 14px",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 300,
                "& .MuiMenuItem-root": {
                  padding: "8px 14px",
                },
              },
            },
          }}
        >
          {menuList?.map((e, index) => (
            <MenuItem
              key={index}
              value={e?.value}
              disabled={e?.disabled}
              sx={{
                "&.Mui-selected": {
                  background: "#EEF5FF",
                  color: "#1D5BBF",
                  fontSize: "14px",
                  fontWeight: 500,
                },
                background: "#FFF",
                color: "#18283D",
                fontSize: "14px",
              }}
            >
              {e?.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
