let events = [];
let isRecording = false;
let lastUrl = location.href;

function logEvent(type, details) {
  if (!isRecording) return;
  const eventData = {
    type,
    details,
    url: location.href,
    timestamp: new Date().toISOString()
  };
  events.push(eventData);
  console.log("Captured Event:", eventData);
}


function getSelector(el) {
  if (!el) return "";

  // 1. aria-label (highest priority)
  if (el.getAttribute("aria-label") && !el.closest(".react-select__control")) {
    return `${el.tagName.toLowerCase()}[aria-label="${CSS.escape(el.getAttribute("aria-label"))}"]`;
  }


  // 3. name
  if (el.name) {
    return `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;
  }

// 2. ID
  if (el.id) {
    return `#${CSS.escape(el.id)}`;
  }

  // 4. data-testid / data-cy
  if (el.dataset.testid) {
    return `[data-testid="${CSS.escape(el.dataset.testid)}"]`;
  }
  if (el.dataset.cy) {
    return `[data-cy="${CSS.escape(el.dataset.cy)}"]`;
  }

   // 5. Text-based selector for buttons (HIGH PRIORITY)
 if (el.tagName === "BUTTON") {
  const buttonText = getElementText(el);
  if (buttonText && buttonText.length > 0 && buttonText.length < 50) {
    return `button:has-text("${buttonText}")`;
  }
}

  // 5. Special cases
  if (el.tagName === "A" && el.getAttribute("href")) {
    return `a[href="${CSS.escape(el.getAttribute("href"))}"]`;
  }
  if (el.tagName === "INPUT" && el.type) {
    return `input[type="${CSS.escape(el.type)}"]`;
  }
  if (el.tagName === "BUTTON" && el.type) {
    return `button[type="${CSS.escape(el.type)}"]`;
  }

  // 6. Text-based selector (Playwright supports it)
  if (el.innerText && el.innerText.trim().length > 0 && el.innerText.trim().length < 50) {
    return `text="${el.innerText.trim()}"`;
  }

  // 7. Class fallback (skip css-* auto-generated classes)
  if (el.className) {
    const classes = el.className
      .split(/\s+/)
      .filter((c) => !/^css-/.test(c))
      .map((c) => CSS.escape(c))
      .join(".");
    if (classes) {
      return `${el.tagName.toLowerCase()}.${classes}`;
    }
  }

  // 8. nth-child fallback
  if (el.parentElement) {
    const siblings = Array.from(el.parentElement.children);
    const index = siblings.indexOf(el) + 1;
    return `${el.tagName.toLowerCase()}:nth-child(${index})`;
  }

  // Fallback: tag only
  return el.tagName.toLowerCase();
}


function getElementText(el) {
  if (el.tagName === "BUTTON") {
    // Method 1: Check for data-original-text (if you can add this attribute)
    if (el.dataset.originalText) {
      return el.dataset.originalText;
    }
    
    // Method 2: Check for aria-label (often contains the original text)
    if (el.getAttribute("aria-label")) {
      return el.getAttribute("aria-label");
    }
    
    // Method 3: Check for title attribute
    if (el.getAttribute("title")) {
      return el.getAttribute("title");
    }
    
    // Method 4: Try to extract text from button's original state
    // Look for common button text patterns in the class names
    const classList = el.className;
    if (classList.includes('save') || classList.includes('submit')) {
      return "Save";
    }
    
    // Method 5: Check if it's a submit button (common pattern)
    if (el.type === "submit") {
      return "Save"; // Default for submit buttons
    }

    // Method 6: Try innerText/textContent (ignores HTML tags)
    const text = el.innerText || el.textContent || "";
    if (text && text.trim() && !text.includes('animate-spin')) {
      return text.trim();
    }
    
    // Method 7: Check for loading state and provide fallback
    if (el.innerHTML.includes('animate-spin') || el.innerHTML.includes('spinner')) {
      return "Save"; // Assume it's a Save button in loading state
    }
  }
  
  const text = el.innerText || el.textContent || "";
  return text.trim();
}


// -----------------------------
// Event Listeners
// -----------------------------

document.addEventListener("click", (e) => {
  const target = e.target.closest("button, a, .react-select__option, [role='button']") || e.target;

  const elementText = getElementText(target);


  const details = {
    tag: target.tagName,
    id: target.id,
    class: target.className,
    text: elementText,
    selector: getSelector(target),
    "aria-label": target.getAttribute("aria-label") || "",
    name: target.name || "",
    placeholder: target.placeholder || "",
    type: target.type || ""
  };

  // Special cases
  if (target.tagName === "A") {
    details.href = target.getAttribute("href");
  }
  if (target.tagName === "INPUT" && target.type === "checkbox") {
    details.checked = target.checked;
  }
  if (target.tagName === "INPUT" && target.type === "radio") {
    details.value = target.value;
  }
  if (target.tagName === "INPUT" && target.type === "file") {
    details.accept = target.getAttribute("accept") || "";
  }
  if (target.tagName === "BUTTON") {
    details.type = target.type || "button";
  }
  if (target.tagName === "LABEL" && target.getAttribute("for")) {
    details.for = target.getAttribute("for");
  }
  if (target.tagName === "OPTION") {
    details.value = target.value;
    details.text = target.innerText.trim();
  }
  if (target.hasAttribute("contenteditable")) {
    details.editable = true;
  }

  // Handle SVG and its children
  if (target.namespaceURI === "http://www.w3.org/2000/svg") {
    const svgParent = target.closest("svg");
    if (svgParent) {
      details.svg = true;
      details.selector = getSelector(svgParent);
    }
  }

  // React Select options
  // React Select options - Enhanced version
const reactOption = target.closest(".react-select__option");
if (reactOption) {
  details.tag = "react-select-option";
  details.text = reactOption.innerText.trim();
}

// React Select handling - Enhanced approach
let reactSelectControl = target.closest(".react-select__control");

// If not found, check if we're clicking on a React Select sub-element
if (!reactSelectControl && (
  target.classList.contains("react-select__input-container") ||
  target.classList.contains("react-select__value-container") ||
  target.classList.contains("react-select__dropdown-indicator") ||
  target.classList.contains("react-select__input") ||
  target.classList.contains("react-select__placeholder")
)) {
  // Look for the control container in parent elements
  let parent = target.parentElement;
  while (parent && !reactSelectControl) {
    if (parent.classList.contains("react-select__control")) {
      reactSelectControl = parent;
      break;
    }
    parent = parent.parentElement;
  }
}

if (reactSelectControl) {
  details.reactSelect = true;
  
  // Get the input field for aria-label reference
  const input = reactSelectControl.querySelector(".react-select__input");
  if (input) {
    details.inputAriaLabel = input.getAttribute("aria-label") || "";
    
    // Use the control container with aria-label for specificity
    if (details.inputAriaLabel) {
      details.selector = `div.react-select__control:has(input[aria-label="${CSS.escape(details.inputAriaLabel)}"])`;
    } else {
      details.selector = "div.react-select__control";
    }
  } else {
    details.selector = "div.react-select__control";
  }

  // Get the placeholder text
  const placeholder = reactSelectControl.querySelector(".react-select__placeholder");
  if (placeholder) {
    details.placeholder = placeholder.innerText.trim();
  }

  // Get the value container for dropdown clicks
  const valueContainer = reactSelectControl.querySelector(".react-select__value-container");
  if (valueContainer) {
    details.valueContainer = true;
  }
  
  // Get the dropdown indicator for dropdown open clicks
  const dropdownIndicator = reactSelectControl.querySelector(".react-select__dropdown-indicator");
  if (dropdownIndicator) {
    details.dropdownIndicator = true;
  }
}

 // MUI Date picker day button
  if (target.tagName === "BUTTON" && target.classList.contains("MuiPickersDay-root")) {
    details.datePicker = true;
    details.day = target.innerText.trim();

    // Try to locate the date picker container (dialog/calendar)
    const candidateContainers = [
      ".MuiPickersCalendar-root",
      ".MuiDatePicker-root",
      ".MuiCalendarPicker-root",
      ".MuiPickersCalendarHeader-root",
      ".MuiPickersLayout-root",
      ".MuiCalendar-root",
      ".MuiDialog-paper",
      ".MuiPaper-root",
      "[role='dialog']",
      "[role='grid']"
    ];

    let datePicker = null;
    for (const sel of candidateContainers) {
      datePicker = target.closest(sel);
      if (datePicker) break;
    }
    if (!datePicker) {
      for (const sel of candidateContainers) {
        datePicker = document.querySelector(sel);
        if (datePicker) break;
      }
    }

    // Extract month/year text if available
    if (datePicker) {
      const monthYearSelectors = [
        ".MuiPickersCalendarHeader-label",
        ".MuiPickersCalendarHeader-title",
        ".MuiPickersCalendarHeader-labelContainer",
        ".MuiPickersCalendarHeader-labelText",
        ".MuiTypography-root",
        "h4", "h5", "h6"
      ];
      let monthYearNode = null;
      for (const sel of monthYearSelectors) {
        const node = datePicker.querySelector(sel);
        if (node && node.innerText && node.innerText.trim()) {
          monthYearNode = node;
          break;
        }
      }
      if (!monthYearNode) {
        const all = datePicker.querySelectorAll("*");
        for (const el of all) {
          const txt = el.innerText?.trim();
          if (txt && /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b.*\d{4}/.test(txt)) {
            monthYearNode = el;
            break;
          }
        }
      }
      if (monthYearNode) {
        details.monthYear = monthYearNode.innerText.trim();
        details.fullDate = `${details.monthYear} ${details.day}`;
      }
    }
  }

  // MUI digital clock (time picker) items
  if (target.tagName === "LI" && target.classList.contains("MuiMultiSectionDigitalClockSection-item")) {
    details.timePicker = true;
    details.timeValue = target.innerText.trim();
    details.timeAriaLabel = target.getAttribute("aria-label") || "";
  }



  logEvent("click", details);
});

// Listen for input events (fires when typing)
document.addEventListener("input", (e) => {
  const target = e.target;
  
  // Check if it's a date/time input field
  if (target.type === "date" || 
      target.placeholder?.includes("MM/DD/YYYY") || 
      target.getAttribute("aria-label")?.includes("Date") ||
      target.getAttribute("aria-label")?.includes("Time") ||
      target.name?.includes("time") ||
      target.name?.includes("date")) {
    
    
    const details = {
      tag: target.tagName,
      id: target.id,
      selector: getSelector(target),
      type: target.type || "",
      "aria-label": target.getAttribute("aria-label") || "",
      name: target.name || "",
      placeholder: target.placeholder || "",
      value: target.value || "",
      dateField: true,
      dateValue: target.value
    };
    
    logEvent("input", details);
  }
});



// input, textarea typing
// Enhanced input event capture
document.addEventListener("change", (e) => {
  const target = e.target;

  // Base details
  const details = {
    tag: target.tagName,
    id: target.id,
    selector: getSelector(target),
    type: target.type || "",
    "aria-label": target.getAttribute("aria-label") || "",
    name: target.name || "",
    placeholder: target.placeholder || ""
  };

  // Handle value safely
  if (["INPUT", "TEXTAREA"].includes(target.tagName)) {
    if (target.type === "file") {
      details.files = Array.from(target.files || []).map(f => f.name);
    } else {
      details.value = (target.value || "")
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  // Handle <select>
  if (target.tagName === "SELECT") {
    details.value = target.value;
    const selectedOption = target.options[target.selectedIndex];
    if (selectedOption) {
      details.text = selectedOption.innerText.trim();
    }
  }

  // Handle <option> directly (if change bubbles from option)
  if (target.tagName === "OPTION") {
    details.value = target.value;
    details.text = target.innerText.trim();
  }

  // Handle contenteditable
  if (target.hasAttribute("contenteditable")) {
    details.editable = true;
    details.value = target.innerText.replace(/\s+/g, " ").trim();
  }

  // Check for date/time input fields
  if (target.type === "date" || 
      target.placeholder?.includes("MM/DD/YYYY") || 
      target.getAttribute("aria-label")?.includes("Date") ||
      target.getAttribute("aria-label")?.includes("Time") ||
      target.name?.includes("time") ||
      target.name?.includes("date")) {
    
    
    const details = {
      tag: target.tagName,
      id: target.id,
      selector: getSelector(target),
      type: target.type || "",
      "aria-label": target.getAttribute("aria-label") || "",
      name: target.name || "",
      placeholder: target.placeholder || "",
      value: target.value || "",
      dateField: true,
      dateValue: target.value
    };
    logEvent("input", details);
    
  }
  logEvent("input", details);
});


// select dropdown changes
document.addEventListener("change", (e) => {
  if (e.target.tagName === "SELECT") {
    logEvent("input", {
      tag: "SELECT",
      id: e.target.id,
      selector: getSelector(e.target),
      value: e.target.value
    });
  }
});

window.addEventListener("beforeunload", () => {
  logEvent("navigation", { action: "beforeunload" });
});

window.addEventListener("popstate", () => {
  logEvent("navigation", { action: "popstate", url: location.href });
});

window.addEventListener("hashchange", () => {
  logEvent("navigation", { action: "hashchange", url: location.href });
});

setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    logEvent("navigation", { action: "url_change", url: location.href });
  }
}, 1000);

// -----------------------------
// Messages from popup
// -----------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "startRecording") {
    isRecording = true;
    events = [];
    sendResponse({ status: "recording started" });
  }
  if (msg.action === "stopRecording") {
    isRecording = false;
    sendResponse({ status: "recording stopped" });
  }
  if (msg.action === "getEvents") {
    sendResponse(events || []); // ✅ never undefined
  }
  if (msg.action === "clearEvents") {
    events = [];
    sendResponse({ status: "cleared" });
  }
  return true; // ✅ ensures async safe response
});

