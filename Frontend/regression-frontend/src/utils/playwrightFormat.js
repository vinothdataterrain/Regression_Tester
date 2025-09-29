// export const convertToPlaywrightFormat = (events) => {
//   if (!events || !events.length) return [];

//   const result = [];

//   result.push({
//     action: "goto",
//     url: "https://cchms.socialroots-dev.net/",
//     value: "",
//   });

//   events.forEach((event) => {
//     const { type, details } = event;
//     const tag = details.tag.toLowerCase();

//     switch (type) {
//       case "navigation":
//         // Go to page
//         result.push({ action: "wait", selector: "", value: "5000" });
//         break;

//       case "input":
//         if (tag === "input" && details.value === "on") {
//           result.push({
//             action: "check",
//             selector: details.selector,
//             value: "",
//           });
//           break;
//         } else if (details.value) {
//           result.push({
//             action: "fill",
//             selector: details.selector || details.id || details.tag,
//             value: details.value,
//           });
//         }
//         break;

//       case "click":
//         // const tag = details.tag.toLowerCase();
//         let selector = details.selector || details.id || tag;

//         if (tag === "button" && details.text) {
//           selector = `button:has-text("${details.text}")`;
//           result.push({ action: "click", selector: selector, value: "" });
//           break;
//         } else if (tag === "span" && details.text) {
//           selector = `span:has-text("${details.text}")`;
//           result.push({ action: "click", selector: selector, value: "" });
//           break;
//         } else if (tag === "li" && details.text) {
//           selector = `li:has-text("${details.text}")`;
//           result.push({ action: "click", selector: selector, value: "" });
//           break;
//         } else if (tag === "a" && details.text) {
//           selector = `a:has-text("${details.text}")`;
//           result.push({ action: "click", selector: selector, value: "" });
//           break;
//         } else if (tag === "svg") {
//           const classes = details.class
//             ? details.class.split(" ").join(".")
//             : "";
//           selector = `svg.${classes}`;
//           result.push({ action: "click", selector: selector, value: "" });
//           break;
//         } else if (tag === "input" && details.type === "checkbox") {
//           // If checkbox, use 'check' action
//           result.push({ action: "check", selector: selector, value: "" });
//           break;
//         } else if (tag === "button" || tag === "a") {
//           result.push({ action: "click", selector: selector, value: "" });
//           break;
//         } else if (tag === "span") {
//           result.push({ action: "click", selector: text, value: "" });
//           break;
//         } else if (tag === "input") {
//           // ignore other clicks on inputs (they will be filled already)
//           break;
//         }
//         // fallback click
//         result.push({ action: "click", selector: selector, value: "" });
//         break;

//       default:
//         break;
//     }
//   });

//   return result;
// };

export const convertToPlaywrightFormat = (events) => {
  if (!events || !events.length) return [];

  const result = [];
  let currentUrl = null;

  // Start with base URL from first event
  if (events[0]?.url) {
    try {
      const origin = new URL(events[0].url).origin;
      result.push({
        action: "goto",
        url: origin,
        value: "",
      });
      currentUrl = origin;
    } catch (e) {
      console.warn("Invalid URL in first event:", events[0].url);
    }
  }

  events.forEach((event, idx) => {
    const { type, details, url } = event;
    const tag = details.tag?.toLowerCase();
    const selector = details.selector || "";
    const text = details.text?.trim();
    const id = details.id;

    // Update current URL if navigation occurred
    if (url && url !== currentUrl) {
      currentUrl = url;
    }

    switch (type) {
      case "navigation": {
        const action = details.action;

        if (action === "url_change" && url) {
          // Only add goto if URL actually changed
          if (url !== currentUrl) {
            result.push({
              action: "goto",
              url: url,
              value: "",
            });
            currentUrl = url;
          }
        } else {
          // Add wait for other navigation events
          result.push({ action: "wait", selector: "", value: "3000" });
        }
        break;
      }

      case "input": {
        if (tag === "input") {
          const inputType = details.type?.toLowerCase();

          if (type === "input" && details.dateField) {
            result.push({
              action: "fill",
              selector:
                details.selector ||
                `input[aria-label="${details["aria-label"]}"]`,
              value: details.dateValue || details.value || "",
            });
          } else if (type === "input" && details.timePicker) {
            result.push({
              action: "fill",
              selector: `input[name="${details.name}"]` || details.selector,
              value: details.timeValue || details.value || "",
            });
          } else if (inputType === "checkbox") {
            // Use the selector from extension, it's already optimized
            result.push({
              action: "check",
              selector: `input${selector}` || selector,
              value: "",
            });
          } else if (inputType === "radio") {
            result.push({
              action: "check",
              selector: `input[value="${details.value}"]` || selector,
              value: "",
            });
          } else if (details.value !== undefined && details.value !== "") {
            // Use extension's optimized selector (now includes aria-label priority)
            result.push({
              action: "fill",
              selector: selector || `input#${id}`,
              value: details.value,
            });
          }
        } else if (tag === "textarea") {
          if (details.value !== undefined) {
            result.push({
              action: "fill",
              selector: selector || `textarea#${id}`,
              value: details.value,
            });
          }
        } else if (tag === "select") {
          if (details.value !== undefined) {
            result.push({
              action: "select",
              selector: `select#${id}` || selector,
              value: details.value,
            });
          }
        }
        break;
      }

      case "click": {
        // React-Select option handling
        if (tag === "react-select-option") {
          // Find the dropdown trigger (usually an input with combobox role)
          let dropdownEvent = null;
          for (let j = idx - 1; j >= 0; j--) {
            if (
              events[j].details?.tag?.toLowerCase() === "input" &&
              events[j].details?.role === "combobox"
            ) {
              dropdownEvent = events[j];
              break;
            }
          }

          if (dropdownEvent) {
            result.push({
              action: "click",
              selector: dropdownEvent.details.selector,
              value: "",
            });
          }

          result.push({
            action: "click",
            selector: `.react-select__menu >> text="${text}"`,
            value: "",
          });
          break;
        }

        // Special handling for different element types
        if (tag === "a" && details.href) {
          if (
            details.class &&
            text
          ) {
            result.push({
              action: "click",
              selector: `a:has-text("${text}")`,
              value: "",
            });
          } else if (details.role === "button" && text) {
            result.push({
              action: "click",
              selector: `a[role="button"]:has-text("${text}")`,
              value: "",
            });
          } else if (text) {
            result.push({
              action: "click",
              selector: `a:has-text("${text}")`,
              value: "",
            });
          } else {
            result.push({
              action: "click",
              selector: `a[href="${details.href}"]`,
              value: "",
            });
          }
        } else if (tag === "input" && details.type === "checkbox") {
          // Checkbox clicks are handled in input events, skip here
          break;
        } else if (tag === "button") {
          if (text) {
            result.push({
              action: "click",
              selector: `button:has-text("${text}")` || selector,
              value: "",
            });
          } else {
            result.push({
              action: "click",
              selector: selector,
              value: "",
            });
          }
        } else if (tag === "div") {
          if (id) {
            result.push({
              action: "click",
              selector: `${tag}[id="${id}"]`,
            });
          } else if (text && !id) {
            result.push({
              action: "click",
              selector:
                `${selector}:has-text("${text}")` ||
                `${tag}:has-text("${text}")` ||
                selector,
              value: "",
            });
          } else {
            result.push({
              action: "click",
              selector: selector,
              value: "",
            });
          }
        } else if (
          ["span", "li", "p", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)
        ) {
          if (text) {
            result.push({
              action: "click",
              selector: `${tag}:has-text("${text}")` || selector,
              value: "",
            });
          } else {
            result.push({
              action: "click",
              selector: selector,
              value: "",
            });
          }
        } else if (tag === "svg") {
          result.push({
            action: "click",
            selector: selector,
            value: "",
          });
        } else {
          // Fallback for any other element
          result.push({
            action: "click",
            selector: selector,
            value: "",
          });
        }
        break;
      }

      default:
        console.warn(`Unknown event type: ${type}`, event);
        break;
    }
  });

  return result;
};
