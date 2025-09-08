export const convertToPlaywrightFormat = (events) => {
  if (!events || !events.length) return [];

  const result = [];

  events.forEach((event) => {
    const { type, details, url } = event;

    switch (type) {
      case "navigation":
        // Go to page
        result.push({ action: "goto", selector: url, value: "" });
        break;

      case "input":
        if (details.value) {
          result.push({
            action: "fill",
            selector: details.selector || details.id || details.tag,
            value: details.value
          });
        }
        break;

      case "click":
        const tag = details.tag.toLowerCase();
        let selector = details.selector || details.id || tag;

        if (tag === "input" && details.type === "checkbox") {
          // If checkbox, use 'check' action
          result.push({ action: "check", selector: selector, value: "" });
        } else if (tag === "button" || tag === "a") {
          result.push({ action: "click", selector: selector, value: "" });
        }
        else if(tag === "span"){
         result.push({action: "", selector: text, value:""})
        }
        else if (tag === "input") {
          // ignore other clicks on inputs (they will be filled already)
        } else {
          // fallback click
          result.push({ action: "click", selector: selector, value: "" });
        }
        break;

      default:
        break;
    }
  });

  return result;
};
