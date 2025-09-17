export const convertToPlaywrightFormat = (events) => {
  if (!events || !events.length) return [];

  const result = [];

  result.push({
    action: "goto",
    url: "https://gridpolaris-test.socialroots-test.net/login",
    value: "",
  });

  events.forEach((event) => {
    const { type, details } = event;
    const tag = details.tag.toLowerCase();

    switch (type) {
      case "navigation":
        // Go to page
        result.push({ action: "wait", selector: "", value: "5000" });
        break;

      case "input":
        if (tag === "input" && details.value === "on") {
          result.push({
            action: "check",
            selector: details.selector,
            value: "",
          });
          break;
        } else if (details.value) {
          result.push({
            action: "fill",
            selector: details.selector || details.id || details.tag,
            value: details.value,
          });
        }
        break;

      case "click":
        // const tag = details.tag.toLowerCase();
        let selector = details.selector || details.id || tag;

        if (tag === "button" && details.text) {
          selector = `button:has-text("${details.text}")`;
          result.push({ action: "click", selector: selector, value: "" });
          break;
        } else if (tag === "span" && details.text) {
          selector = `span:has-text("${details.text}")`;
          result.push({ action: "click", selector: selector, value: "" });
          break;
        } else if (tag === "li" && details.text) {
          selector = `li:has-text("${details.text}")`;
          result.push({ action: "click", selector: selector, value: "" });
          break;
        } else if (tag === "svg") {
          const classes = details.class
            ? details.class.split(" ").join(".")
            : "";
          selector = `svg.${classes}`;
          result.push({ action: "click", selector: selector, value: "" });
          break;
        } else if (tag === "input" && details.type === "checkbox") {
          // If checkbox, use 'check' action
          result.push({ action: "check", selector: selector, value: "" });
          break;
        } else if (tag === "button" || tag === "a") {
          result.push({ action: "click", selector: selector, value: "" });
          break;
        } else if (tag === "span") {
          result.push({ action: "click", selector: text, value: "" });
          break;
        } else if (tag === "input") {
          // ignore other clicks on inputs (they will be filled already)
          break;
        }
        // fallback click
        result.push({ action: "click", selector: selector, value: "" });
        break;

      default:
        break;
    }
  });

  return result;
};
