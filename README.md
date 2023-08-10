# GA4 Tag Checker

This code was created during my contract at Accenture for the Inner project. The purpose of this code is to test 15 BMW market pages for the presence of the GA4 (Google Analytics 4) snippet.

## Overview

This script is designed to check for the presence of the GA4 script on a set of web pages within a domain. It does this by opening each page and checking for the presence of the GA4 script or the `gtag` function.

## Features

- Extracts all internal links from the current page.
- Filters out links with specific blacklisted keywords.
- Processes pages in batches to avoid overwhelming the browser.
- Checks for the presence of the GA4 script or the `gtag` function on each page.
- Generates a report detailing which pages have the GA4 tag, which don't, and any errors encountered.
- Stores the report in the browser's Session Storage.

## Configuration

The script contains a `CONFIG` object which allows for customization:

- `MAX_CONCURRENT_TABS`: Maximum number of tabs to open concurrently.
- `MAX_CHECKS`: Maximum number of checks to perform on a page before giving up.
- `CHECK_INTERVAL`: Time interval (in milliseconds) between checks.
- `BLACKLIST_KEYWORDS`: List of keywords that, if present in a URL, will exclude the URL from being checked.

## How to Use

1. Navigate to the root page of the domain you want to check.
2. Open the browser's developer console.
3. Paste and run the provided script.
4. Wait for the script to process all pages and generate a report.
5. The report will be logged to the console and stored in Session Storage under the key `gaReport`.

## Note

- The script uses both the `window.open` method and the `chrome.tabs` API. The latter is specific to the Chrome browser and its extensions. Ensure you're running the script in an environment that supports the used methods.
- Ensure pop-ups are allowed for the domain you're checking, as the script may open multiple tabs.

## Disclaimer

Use this script responsibly. Opening too many tabs concurrently can overwhelm the browser and the server hosting the web pages. Adjust the `CONFIG` values as needed to suit your environment.
