// Helper function to check if an event is a date/time field
const isDateField = (event) => {
  const { type, details } = event;
  if (type !== "input") return false;

  return (
    details.dateField ||
    details.type === "date" ||
    details.placeholder?.includes("MM/DD/YYYY") ||
    details.placeholder?.includes("hh:mm") ||
    details["aria-label"]?.includes("Date") ||
    details["aria-label"]?.includes("Time") ||
    details["aria-label"]?.includes("Birth") ||
    details.name?.includes("time") ||
    details.name?.includes("date") ||
    details.name?.includes("duration")
  );
};

// Helper function to check if a click event is on a date/time field
const isDateFieldClick = (event) => {
  const { type, details } = event;
  if (type !== "click") return false;

  const ariaLabel = details["aria-label"] || "";
  const placeholder = details.placeholder || "";
  const name = details.name || "";

  return (
    ariaLabel.includes("Date") ||
    ariaLabel.includes("Time") ||
    ariaLabel.includes("Birth") ||
    placeholder.includes("MM/DD/YYYY") ||
    placeholder.includes("hh:mm") ||
    name.includes("time") ||
    name.includes("date") ||
    name.includes("duration")
  );
};

// Helper function to check if a click event is a calendar date picker interaction
const isCalendarDatePicker = (event) => {
  const { type, details } = event;
  if (type !== "click") return false;

  return details.datePicker === true && details.day && details.fullDate;
};

// Helper function to check if a date/time value is complete
const isCompleteDate = (value) => {
  if (!value) return false;
  // Check if the value matches MM/DD/YYYY format with all parts filled
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  // Check if the value matches hh:mm format for time fields
  const timePattern = /^\d{1,2}:\d{2}$/;
  // Check if the value matches MM/DD/YYYY hh:mm AM/PM format (calendar complete)
  const dateTimePattern = /^\d{2}\/\d{2}\/\d{4} \d{1,2}:\d{2} (AM|PM)$/;
  return (
    datePattern.test(value) ||
    timePattern.test(value) ||
    dateTimePattern.test(value)
  );
};

// Helper function to check if an event is a calendar complete event
const isCalendarCompleteEvent = (event) => {
  const { type, details } = event;
  return type === "input" && details.calendarComplete === true;
};

// Helper function to check if a click event is on a calendar input field
const isCalendarInputClick = (event) => {
  const { type, details } = event;
  if (type !== "click") return false;

  // Check if it's a click on date/time input fields
  const ariaLabel = details["aria-label"] || "";
  const placeholder = details.placeholder || "";
  const name = details.name || "";

  return (
    (ariaLabel.includes("Time") ||
      ariaLabel.includes("Date") ||
      placeholder.includes("MM/DD/YYYY") ||
      placeholder.includes("hh:mm") ||
      name.includes("time") ||
      name.includes("date") ||
      name.includes("duration")) &&
    details.tag === "INPUT"
  );
};

// Helper function to check if a click event is an intermediate calendar interaction
const isIntermediateCalendarClick = (event) => {
  const { type, details } = event;
  if (type !== "click") return false;

  // Check for date picker clicks
  if (details.datePicker === true) return true;

  // Check for time picker clicks
  if (details.timePicker === true) return true;

  // Check for calendar-related button clicks (like "Choose date")
  if (details.tag === "BUTTON" && details["aria-label"] === "Choose date")
    return true;

  return false;
};

// Helper function to optimize date field events
const optimizeDateFieldEvents = (events) => {
  const dateFieldGroups = new Map();
  const optimizedEvents = [];

  // Group events by selector for date fields (both click and input events)
  events.forEach((event, index) => {
    const isDateInput = isDateField(event) && event.details.id;
    const isDateClick = isDateFieldClick(event);
    const isCalendarComplete = isCalendarCompleteEvent(event);
    const isIntermediateCalendar = isIntermediateCalendarClick(event);
    const isCalendarInputClickEvent = isCalendarInputClick(event);

    if (isCalendarComplete) {
      // Calendar complete events should be kept as-is (they already contain the final value)
      optimizedEvents.push({ event, index });
    } else if (isIntermediateCalendar) {
      // Skip intermediate calendar interaction clicks (date picker, time picker, etc.)
      return; // Skip this event
    } else if (isCalendarInputClickEvent) {
      // Skip clicks on calendar input fields (they're just triggers for calendar)
      return; // Skip this event
    } else if (isDateInput || isDateClick) {
      // Use selector as the key for grouping (more reliable than ID for clicks)
      const selector = event.details.selector || event.details.id || "";

      if (!dateFieldGroups.has(selector)) {
        dateFieldGroups.set(selector, []);
      }
      dateFieldGroups.get(selector).push({ event, index });
    } else {
      optimizedEvents.push({ event, index });
    }
  });

  // For each date field group, keep only the first click and final input
  dateFieldGroups.forEach((group) => {
    // Sort by index to maintain order
    group.sort((a, b) => a.index - b.index);

    const clickEvents = group.filter((item) => item.event.type === "click");
    const inputEvents = group.filter((item) => item.event.type === "input");

    // Keep the first click event
    if (clickEvents.length > 0) {
      optimizedEvents.push(clickEvents[0]);
    }

    // For input events, find the last event with a complete date value
    if (inputEvents.length > 0) {
      let finalInputEvent = null;
      for (let i = inputEvents.length - 1; i >= 0; i--) {
        const { event } = inputEvents[i];
        const value = event.details.dateValue || event.details.value || "";

        if (isCompleteDate(value)) {
          finalInputEvent = event;
          break;
        }
      }

      // If no complete date found, use the last input event
      if (!finalInputEvent) {
        finalInputEvent = inputEvents[inputEvents.length - 1].event;
      }

      optimizedEvents.push({
        event: finalInputEvent,
        index: inputEvents[inputEvents.length - 1].index,
      });
    }
  });

  // Sort by original index to maintain event order
  optimizedEvents.sort((a, b) => a.index - b.index);

  return optimizedEvents.map((item) => item.event);
};

export const convertToPlaywrightFormat = (events) => {
  if (!events || !events.length) return [];

  // Optimize date field events first
  const optimizedEvents = optimizeDateFieldEvents(events);

  const result = [];
  let currentUrl = null;

  // Look for initial navigation event with "goto" action first
  const initialNavigationEvent = events.find(
    (event) =>
      event.type === "navigation" &&
      event.details?.action === "goto" &&
      event.url
  );

  if (initialNavigationEvent) {
    // Use the initial navigation event URL
    try {
      const url = initialNavigationEvent.url;
      result.push({
        action: "goto",
        url: url,
        value: "",
      });
      currentUrl = url;
    } catch (e) {
      console.warn(
        "Invalid URL in initial navigation event:",
        initialNavigationEvent.url
      );
    }
  } else if (events[0]?.url) {
    // Fallback to first event URL if no navigation event found
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

  optimizedEvents.forEach((event, idx) => {
    const { type, details } = event;
    const tag = details.tag?.toLowerCase();
    const selector = details.selector || "";
    const text = details.text?.trim();
    const id = details.id;
    const aria_label = details["aria-label"];

    switch (type) {
      case "navigation": {
        // Skip all navigation events except initial goto
        // Individual actions will handle their own navigation automatically
        break;
      }

      case "input": {
        if (tag === "input") {
          const inputType = details.type?.toLowerCase();

          // Handle calendar complete events (pre-formatted date/time values)
          if (details.calendarComplete) {
            result.push({
              action: "fill",
              selector: details.selector || `input[name="${details.name}"]`,
              value: details.value || "",
            });
          } else if (type === "input" && details.dateField) {
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
        // Skip intermediate calendar interaction clicks
        if (isIntermediateCalendarClick(event) || isCalendarInputClick(event)) {
          //skip calendar click in conversion
          break;
        }

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
          if (details.text && aria_label === "") {
            result.push({
              action: "click",
              selector: selector || `a:has-text("${text})`,
              value: "",
            });
          } else if (details.class && text) {
            result.push({
              action: "click",
              selector: `a:has-text("${text}")` || selector,
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
        } 
        else if (tag === "button") {
          if (aria_label) {
            result.push({
              action: "click",
              selector: selector || `button[aria-label="${aria_label}"]`,
              value: "",
            });
          } else if (text && !aria_label) {
            result.push({
              action: "click",
              selector: selector || `button:has-text("${text}")`,
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
          const role = details.role || "";
          const isHeadlessUI =
            (id && id.startsWith("headlessui-")) ||
            (details.class && details.class.includes("headlessui")) ||
            ["option", "listbox", "menuitem", "combobox"].includes(role);
          if (isHeadlessUI) {
            if (role && text) {
              result.push({
                action: "click",
                selector: `div[role="${role}"]:has-text("${text}")`,
                value: "",
              });
            } else if (role) {
              result.push({
                action: "click",
                selector: `div[role="${role}"]`,
                value: "",
              });
            } else if (text) {
              result.push({
                action: "click",
                selector: `div:has-text("${text}")`,
                value: "",
              });
            } else {
              result.push({
                action: "click",
                selector: selector,
                value: "",
              });
            }
          } else {
            if (id && !id.startsWith("headlessui-")) {
              result.push({
                action: "click",
                selector: `${tag}[id="${id}"]`,
                value: "",
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
