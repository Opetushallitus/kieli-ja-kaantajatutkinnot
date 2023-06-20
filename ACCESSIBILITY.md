# Kieli- ja kääntäjätutkinnot

You may find general accessibility guidelines in this document to encompass development across all projects.

Keep in mind: `No ARIA is better than bad ARIA`

## Tools

- [VoiceOver](https://www.unimelb.edu.au/accessibility/tools/testing-web-pages-with-voiceover)
- [Axe devTools Chrome Extension](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)

## Resources

- [ARIA implementation guide](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA specification](https://www.w3.org/TR/wai-aria-1.2/)
- [Accessibility support check](https://a11ysupport.io/)

## Guides

- [Dropdown](https://www.24a11y.com/2019/select-your-poison-part-2/#select-poison-recommendations)

## General guidelines

- Each interactive element should have an accessible and understandable name
- Use native html elements where possible as they have keyboard access and accessibility already built-in. E.g. `<button />`, `<header />`, `<main />`
- Do not sprinkle aria on components just in case, refer to ARIA implementation guide and specification when in doubt. No ARIA is better than bad ARIA.
- In addition to screen reader, check that content can also be accessed via keyboard

## Usability considerations

- `disabled`property and state on components (e.g. input fields, buttons) should only be used in relation to async task(s) (e.g. network request) to signal an on-going transaction. E.g. avoid using disabled input fields, display the value as plain text instead
