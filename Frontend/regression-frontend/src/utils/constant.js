export const DOMAIN = "http://127.0.0.1:8000/"

export const PLAYWRIGHT_ACTIONS = [
  {
    value: "goto",
    label: "Go to URL",
    field: "URL",
    icon: "🌐",
    description: "Navigate to a specific URL",
    example: "https://example.com/login",
  },
  {
    value: "click",
    label: "Click Element",
    field: "Selector",
    icon: "👆",
    description: "Click on an element (button, link, etc.)",
    example: 'button[type="submit"], #login-btn, .submit-button',
  },
  {
    value: "fill",
    label: "Fill Input",
    field: "Selector, Value",
    icon: "✏️",
    description: "Fill an input field with text",
    example: 'input[name="fieldname"], #fieldname, input[type="fieldname"]',
  },
  {
    value: "select",
    label: "Select Option",
    field: "Selector, Value",
    icon: "📋",
    description: "Select an option from dropdown",
    example: 'select[name="country"], #dropdown',
  },
  {
    value: "check",
    label: "Check Checkbox",
    field: "Selector",
    icon: "☑️",
    description: "Check a checkbox",
    example: 'input[type="checkbox"], #remember-me',
  },
  {
    value: "uncheck",
    label: "Uncheck Checkbox",
    field: "Selector",
    icon: "☐",
    description: "Uncheck a checkbox",
    example: 'input[type="checkbox"], #newsletter',
  },
  {
    value: "expect_text",
    label: "Expect Text",
    field: "Selector, Text",
    icon: "📝",
    description: "Verify that element contains specific text",
    example: "h1, .welcome-message, #success-msg",
  },
  {
    value: "expect_visible",
    label: "Expect Visible",
    field: "Selector",
    icon: "👁️",
    description: "Verify that element is visible on page",
    example: ".success-message, #dashboard, .user-profile",
  },
  {
    value: "wait",
    label: "Wait",
    field: "Selector, Value",
    icon: "⏳",
    description: "Wait for specified time",
    example: "2000 (for 2 seconds), 5000 (for 5 seconds)",
  },
];

export const SELECTOR_EXAMPLES = {
  email: [
    'input[name="fieldname"]',
    'input[type="fieldname"]',
    "#fieldname",
    ".fieldname-input",
  ],
  password: [
    'input[name="password"]',
    'input[type="password"]',
    "#password",
    ".password-input",
  ],
  login: [
    'button[type="submit"]',
    'input[type="submit"]',
    "#login-btn",
    ".login-button",
    'button:has-text("Login")',
  ],
  username: ['input[name="username"]', "#username", ".username-input"],
  submit: [
    'button[type="submit"]',
    'input[type="submit"]',
    ".submit-btn",
    'button:has-text("Submit")',
  ],
};

export function formatTableNullValues(rowData) {
  const formattedEmpty = rowData?.map((item, index) => {
    const formattedItem = {}
    for (let key in item) {
      if (item[key] === "" || item[key] === null || item[key] === undefined) {
        formattedItem[key] = ""
      }
      else {
        formattedItem[key] = item[key]
      }
    }
    return formattedItem;
  })
  return formattedEmpty

}