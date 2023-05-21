# GA4 Tag Checker

This code was created during my contract at Accenture for the Inner project. The purpose of this code is to test 15 BMW market pages for the presence of the GA4 (Google Analytics 4) snippet. It retrieves the links from the main domain, opens each link in a new tab, waits for the page to load, checks for the presence of the GA4 snippet, and stores the results in the "gaReport" object.

## Instructions

1. Add the code snippet to your JavaScript file or browser console.
2. Open the website where you want to test the GA4 snippet.
3. The code will automatically retrieve the links from the main domain and check the presence of the GA4 snippet on each page.
4. After processing all pages, the results will be stored in the "gaReport" object, which can be accessed in the browser's Session Storage.

## Usage

1. Copy the code from the code snippet provided.
2. Paste the code into your JavaScript file or directly into the browser console.
3. Open the website you want to test.
4. Wait for the code to finish processing all pages.
5. Access the results by retrieving the "gaReport" object from the browser's Session Storage.

## Error Handling

The code includes error handling for common scenarios such as "ERR_TOO_MANY_REDIRECTS" and exceptions during page processing. Any errors encountered during the process will be stored in the "gaReport.errors" array, allowing you to identify and handle any issues that may arise.

## Notes

- The code excludes pages containing the keyword "hybrides-rechargeables" from the "allPages" array and future checks.
- The results are stored in the "gaReport" object, which includes the following properties:
  - "allPages": Object containing all the processed pages.
  - "pagesWithTag": Object containing pages with the GA4 snippet.
  - "pagesNoTag": Object containing pages without the GA4 snippet.
  - "pagesWithTagRFO": Object containing pages with the GA4 snippet and the keyword "RFO".
  - "pagesWithTagTDA": Object containing pages with the GA4 snippet and the keyword "TDA".
  - "errors": Array storing any encountered errors during the process.

