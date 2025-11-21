let events = [];
let isRecording = false;
let lastUrl = location.href;

// Load events from storage on script load
chrome.storage.local.get(['recordedEvents'], (result) => {
  if (result.recordedEvents && Array.isArray(result.recordedEvents)) {
    events = result.recordedEvents;
  }
});

// Calendar interaction tracking
let calendarInteraction = {
  active: false,
  targetInput: null,
  dateValue: null,
  timeValue: null,
  durationValue: null,
  startTime: null,
  currentHours: null,
  currentMinutes: null,
  currentAmPm: null
};

function logEvent(type, details) {
  if (!isRecording) return;
  const eventData = {
    type,
    details,
    url: location.href,
    timestamp: new Date().toISOString()
  };
  events.push(eventData);
  // Persist to storage after each event
  chrome.storage.local.set({ recordedEvents: events });
}

// Helper function to format date from calendar interaction
function formatCalendarDate(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;
  
  try {
    // Parse "October 2025 13" format
    const dateMatch = dateValue.match(/(\w+)\s+(\d{4})\s+(\d{1,2})/);
    if (!dateMatch) return null;
    
    const [, monthName, year, day] = dateMatch;
    const monthMap = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    
    const month = monthMap[monthName];
    if (!month) return null;
    
    // Format day with leading zero
    const formattedDay = day.padStart(2, '0');
    
    // Combine date and time
    return `${month}/${formattedDay}/${year} ${timeValue}`;
  } catch (e) {
    console.warn('Error formatting calendar date:', e);
    return null;
  }
}

// Helper function to format time from time picker interactions
function formatTimeValue(hours, minutes, ampm) {
  if (!hours || !minutes || !ampm) return null;
  
  // Convert to 24-hour format if needed, or keep as is for display
  let formattedHours = hours.padStart(2, '0');
  let formattedMinutes = minutes.padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Helper function to complete calendar interaction
function completeCalendarInteraction() {
  if (!calendarInteraction.active || !calendarInteraction.targetInput) {
    return;
  }  
  let finalValue = null;
  
  // Determine the type of calendar interaction
  if (calendarInteraction.dateValue && calendarInteraction.targetInput.name === "start_time") {
    // Date and time picker (like start_time)
    let timeValue = calendarInteraction.timeValue;
    
    // If we don't have a complete time value, try to construct it
    if (!timeValue && calendarInteraction.currentHours && calendarInteraction.currentAmPm) {
      // Default minutes to 00 if not set
      const minutes = calendarInteraction.currentMinutes || "00";
      timeValue = formatTimeValue(
        calendarInteraction.currentHours,
        minutes,
        calendarInteraction.currentAmPm
      );
    }
    
    if (timeValue) {
      finalValue = formatCalendarDate(calendarInteraction.dateValue, timeValue);
    }
  } else if (calendarInteraction.durationValue) {
    // Duration picker (time only)
    finalValue = calendarInteraction.durationValue;
  } else if (calendarInteraction.dateValue && !calendarInteraction.targetInput.name) {
    // Fallback: if we have a date but no specific field, try to construct time
    let timeValue = calendarInteraction.timeValue;
    if (!timeValue && calendarInteraction.currentHours && calendarInteraction.currentAmPm) {
      const minutes = calendarInteraction.currentMinutes || "00";
      timeValue = formatTimeValue(
        calendarInteraction.currentHours,
        minutes,
        calendarInteraction.currentAmPm
      );
    }
    if (timeValue) {
      finalValue = formatCalendarDate(calendarInteraction.dateValue, timeValue);
    }
  }
  
  
  if (finalValue) {
    // Create a final input event with the complete value
    const finalEvent = {
      type: "input",
      details: {
        tag: "INPUT",
        id: calendarInteraction.targetInput.id,
        selector: calendarInteraction.targetInput.selector || `input[name="${calendarInteraction.targetInput.name}"]`,
        type: "text",
        "aria-label": calendarInteraction.targetInput["aria-label"] || "",
        name: calendarInteraction.targetInput.name || "",
        placeholder: calendarInteraction.targetInput.placeholder || "",
        value: finalValue,
        calendarComplete: true,
        originalCalendarEvents: calendarInteraction.startTime
      },
      url: location.href,
      timestamp: new Date().toISOString()
    };
    

    events.push(finalEvent);
    // Persist to storage
    chrome.storage.local.set({ recordedEvents: events });
  }
  
  // Reset calendar interaction
  calendarInteraction = {
    active: false,
    targetInput: null,
    dateValue: null,
    timeValue: null,
    durationValue: null,
    startTime: null,
    currentHours: null,
    currentMinutes: null,
    currentAmPm: null
  };
}

function recordInitialUrl () {
  // Always record the initial URL regardless of isRecording state
  // This ensures we capture the starting page URL
  const initialEvent = {
    type : "navigation",
    details : {
      action : "goto",
      url : location.href
    },
    url: location.href,
    timestamp: new Date().toISOString()
  };
  
  events.push(initialEvent);
  // Persist to storage
  chrome.storage.local.set({ recordedEvents: events });
}

// function getNearestSection(el) {
//   let parent = el.parentElement;
//   while (parent) {
//     // Look for a wrapper div with section text
//     console.log("parent",parent)
//     const sectionDiv = parent.querySelector(".text-base,.text-lg,.text-xl");
//     if (sectionDiv && sectionDiv.innerText.trim().length > 0) {
//       // Return the section container + title text
//       const titleText = sectionDiv.innerText.trim();
//       return {
//         titleText,
//         container: parent.closest("div.flex.justify-between") || parent
//       };
//     }
//     parent = parent.parentElement;
//   }
//   return null;
// }

// Check uniqueness of a selector
function isUnique(selector) {
  try {
    const matches = document.querySelectorAll(selector);
    return matches.length === 1;
  } catch {
    return false;
  }
}


function getNearestSection(el) {
  if (!el) return null;

  // Take the immediate parent div
  const parentDiv = el.closest("div.flex.justify-between") || el.parentElement;
  if (!parentDiv) return null;

  // Look for a section title inside this div only
  const sectionDiv = parentDiv.querySelector(".text-base,.text-lg,.text-xl");
  if (sectionDiv && sectionDiv.innerText.trim().length > 0) {
    return {
      titleText: sectionDiv.innerText.trim(),
      container: parentDiv
    };
  }

  // If nothing found in the immediate parent div, return null
  return null;
}


function getSelector(el) {
  if (!el) return "";

  const tag = el.tagName.toLowerCase();
  const text = (el.innerText || el.textContent || "").trim();

    // get placehoder
  if(el.getAttribute("placeholder")){
    return `${el.tagName.toLowerCase()}[placeholder="${CSS.escape(el.getAttribute("placeholder"))}"]`;
  }

  // 1. aria-label (highest priority)
  if (el.getAttribute("aria-label") && !el.closest(".react-select__control")) {
     const labelText = el.getAttribute("aria-label").toLowerCase();
      // Base selector
  let selector = `${el.tagName.toLowerCase()}[aria-label="${CSS.escape(el.getAttribute("aria-label"))}"]`;
// If aria-label contains "search", add :visible
  if (labelText.includes("search")) {
    selector += ":visible";
  }
    return selector;
  }


  // 3. name
  if (el.name) {
    return `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;
  }

   // Headless UI component handling
  const role = el.getAttribute("role");
  const headlessId = el.id || "";
  const headlessClasses = el.className || "";

  const isHeadlessUI =
    headlessId.startsWith("headlessui-") ||
    /headlessui/i.test(headlessClasses) ||
    (role && ["option", "listbox", "menuitem", "combobox"].includes(role));

  if (isHeadlessUI) {
    const visibleText = (el.innerText || "").trim();

    // Prefer stable role + text
    if (role && visibleText) {
      return `${tag}[role="${role}"]:has-text("${visibleText}")`;
    }

    if (role) {
      return `${tag}[role="${role}"]`;
    }

    if (visibleText) {
      return `${tag}:has-text("${visibleText}")`;
    }
  }
// 2. ID
  if (el.id && !el.id.startsWith("headlessui-")) {
    return `#${CSS.escape(el.id)}`;
  }

  // 4. data-testid / data-cy
  if (el.dataset.testid) {
    return `[data-testid="${CSS.escape(el.dataset.testid)}"]`;
  }
  if (el.dataset.cy) {
    return `[data-cy="${CSS.escape(el.dataset.cy)}"]`;
  }

   // 5. Button / A tag handling
 if ((tag === "button" || tag === "a") && text && text.toLowerCase().includes("add")) {
    const section = getNearestSection(el);
    if (section) {
      return `div.flex.justify-between:has-text("${section.titleText}") ${tag}:has-text("${text}")`;
    } else {
      // fallback if no section found
      return `${tag}:has-text("${text}")`;
    }
  }

   // 6. Normal button text
  if (tag === "button" && text.length > 0 && text.length < 50) {
    return `button:has-text("${text}")`;
  }

  // 7. Special cases
  if (el.tagName === "A" && el.getAttribute("href")) {
    return `a[href="${CSS.escape(el.getAttribute("href"))}"]`;
  }
  if (el.tagName === "INPUT" && el.type) {
    return `input[type="${CSS.escape(el.type)}"]`;
  }
  if (el.tagName === "BUTTON" && el.type) {
    return `button[type="${CSS.escape(el.type)}"]`;
  }

  // 8. Text-based selector (Playwright supports it)
  if (el.innerText && el.innerText.trim().length > 0 && el.innerText.trim().length < 50) {
    return `text="${el.innerText.trim()}"`;
  }

  //9. Img tag
  if(el.tagName === "IMG"){
    const alt = el.getAttribute("alt") || ""
    return `img[alt="${alt}"]`
  }

  // 9. Class fallback (skip css-* auto-generated classes)
  if (el.className) {
    const classNameStr = typeof el.className === "string" ? el.className : el.className.baseVal || "";
    const classes = classNameStr
      .split(/\s+/)
      .filter((c) => !/^css-/.test(c))
      .map((c) => CSS.escape(c))
      .join(".");
    if (classes) {
      return `${el.tagName.toLowerCase()}.${classes}`;
    }
  }

  // 10. nth-child fallback
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
    
    // Method 4: Try innerText/textContent FIRST (ignores HTML tags)
    const text = el.innerText || el.textContent || "";
    if (text && text.trim() && !text.includes('animate-spin')) {
      return text.trim(); // Return actual text first!
    }
    
    // Method 5: Check if it's a submit button (common pattern) - MOVED DOWN
    if (el.type === "submit") {
      return "Save"; // Default for submit buttons
    }
    
    // Method 6: Look for common button text patterns in the class names
    const classList = el.className;
    if (classList.includes('save') || classList.includes('submit')) {
      return "Save";
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
    role: target.getAttribute("role") || "",
    "aria-label": target.getAttribute("aria-label") || "",
    name: target.name || "",
    placeholder: target.placeholder || "",
    type: target.type || ""
  };

  // Special cases
  if (target.tagName === "A") {
    details.href = target.getAttribute("href");
  }
  
  //image class
  if( target.tagName === "IMG"){
    details.tag = "IMG",
    details.src = target.getAttribute("src") || "",
    details.alt = target.getAttribute("alt") || ""
  }

  // Handle "Choose date" button clicks to start calendar interaction
  if (target.tagName === "BUTTON" && target.getAttribute("aria-label") === "Choose date") {

    calendarInteraction.active = true;
    calendarInteraction.startTime = Date.now();
    
    // Look for the associated input field
    const inputField = target.closest("form")?.querySelector("input[name='start_time']") || 
                      document.querySelector("input[name='start_time']");
    
    if (inputField) {
      calendarInteraction.targetInput = {
        id: inputField.id,
        selector: getSelector(inputField),
        "aria-label": inputField.getAttribute("aria-label") || "",
        name: inputField.name || "",
        placeholder: inputField.placeholder || ""
      };
    }
  }
  
  // Handle clicks on start_time input field
  if (target.tagName === "INPUT" && target.name === "start_time") {
    if (!calendarInteraction.active) {
      calendarInteraction.active = true;
      calendarInteraction.startTime = Date.now();
      calendarInteraction.targetInput = {
        id: target.id,
        selector: getSelector(target),
        "aria-label": target.getAttribute("aria-label") || "",
        name: target.name || "",
        placeholder: target.placeholder || ""
      };
    }
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
        
        // Start tracking calendar interaction
        if (!calendarInteraction.active) {
          calendarInteraction.active = true;
          calendarInteraction.startTime = Date.now();
          // Find the associated input field (look for recent input clicks)
          const recentInputEvents = events.slice(-10).reverse();
          for (const event of recentInputEvents) {
            if (event.type === "click" && event.details.tag === "INPUT" && 
                (event.details["aria-label"]?.includes("Time") || event.details.name?.includes("time") || event.details.name?.includes("start_time"))) {
              calendarInteraction.targetInput = event.details;
              break;
            }
          }
        }
        
        // Store the date value
        calendarInteraction.dateValue = details.fullDate;
      }
    }
  }

  // MUI digital clock (time picker) items
  if (target.tagName === "LI" && target.classList.contains("MuiMultiSectionDigitalClockSection-item")) {
    details.timePicker = true;
    details.timeValue = target.innerText.trim();
    details.timeAriaLabel = target.getAttribute("aria-label") || "";
    
    // Track time picker interactions
    if (calendarInteraction.active) {
      const ariaLabel = target.getAttribute("aria-label") || "";
      const timeValue = target.innerText.trim();
      
      
      // Determine if this is hours, minutes, or AM/PM
      if (ariaLabel.includes("hours")) {
        calendarInteraction.currentHours = timeValue;
      } else if (ariaLabel.includes("minutes")) {
        calendarInteraction.currentMinutes = timeValue;
      } else if (ariaLabel.includes("AM") || ariaLabel.includes("PM")) {
        calendarInteraction.currentAmPm = timeValue;
        
        // Complete the time value if we have all components
        if (calendarInteraction.currentHours && calendarInteraction.currentMinutes && calendarInteraction.currentAmPm) {
          calendarInteraction.timeValue = formatTimeValue(
            calendarInteraction.currentHours,
            calendarInteraction.currentMinutes,
            calendarInteraction.currentAmPm
          );
        }
      }
      
      // Check if this is a duration field (different from start_time)
      const recentInputEvents = events.slice(-10).reverse();
      for (const event of recentInputEvents) {
        if (event.type === "click" && event.details.tag === "INPUT" && 
            event.details.name === "duration") {
          // This is a duration field, not start_time
          if (calendarInteraction.currentHours && calendarInteraction.currentMinutes) {
            calendarInteraction.durationValue = `${calendarInteraction.currentHours}:${calendarInteraction.currentMinutes}`;
          }
          break;
        }
      }
    }
  }



  logEvent("click", details);
  
  // Check if calendar interaction should be completed
  if (calendarInteraction.active) {
    // If clicking outside calendar components, complete the interaction
    const isCalendarComponent = target.closest(".MuiPickersDay-root, .MuiMultiSectionDigitalClockSection-item, .MuiPickersCalendar-root, .MuiDatePicker-root, .MuiDialog-paper, .MuiPickersLayout-root, .MuiCalendar-root");
    
    if (!isCalendarComponent) {
      // Complete the calendar interaction after a short delay
      setTimeout(() => {
        completeCalendarInteraction();
      }, 500);
    } else {
      // Also complete if we have enough data and it's been a while
      const timeSinceStart = Date.now() - calendarInteraction.startTime;
      if (timeSinceStart > 5000) { // 5 seconds timeout
        setTimeout(() => {
          completeCalendarInteraction();
        }, 100);
      }
    }
  }
}, true);

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
      role: target.getAttribute("role") || "",
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
    role: target.getAttribute("role") || "",
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
      role: target.getAttribute("role") || "",
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

// Navigation event listeners removed - only initial URL capture is needed
// Individual actions (clicks on links, etc.) will handle navigation automatically
// window.addEventListener("beforeunload", () => {
//   logEvent("navigation", { action: "beforeunload" });
// });

// window.addEventListener("popstate", () => {
//   logEvent("navigation", { action: "popstate", url: location.href });
// });

// window.addEventListener("hashchange", () => {
//   logEvent("navigation", { action: "hashchange", url: location.href });
// });

// setInterval(() => {
//   if (location.href !== lastUrl) {
//     lastUrl = location.href;
//     logEvent("navigation", { action: "url_change", url: location.href });
//   }
// }, 1000);

// -----------------------------
// Messages from popup
// -----------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "startRecording") {
    isRecording = true;
    events = [];
    // Clear storage when starting new recording
    chrome.storage.local.set({ recordedEvents: [] }, () => {
      recordInitialUrl();
    });
    sendResponse({ status: "recording started" });
  }
  if (msg.action === "stopRecording") {
    isRecording = false;
    // Ensure we have the latest events from storage before logging
    chrome.storage.local.get(['recordedEvents'], (result) => {
      if (result.recordedEvents && Array.isArray(result.recordedEvents)) {
        events = result.recordedEvents;
      }
      sendResponse({ status: "recording stopped" });
    });
    return true; // Keep channel open for async response
  }
  if (msg.action === "getEvents") {
    // Get latest events from storage before sending
    chrome.storage.local.get(['recordedEvents'], (result) => {
      if (result.recordedEvents && Array.isArray(result.recordedEvents)) {
        events = result.recordedEvents;
      }
      sendResponse(events || []); // ✅ never undefined
    });
    return true; // Keep channel open for async response
  }
  if (msg.action === "clearEvents") {
    events = [];
    chrome.storage.local.set({ recordedEvents: [] });
    sendResponse({ status: "cleared" });
  }
  return true; // ✅ ensures async safe response
});

