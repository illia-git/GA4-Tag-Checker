const domain = window.location.hostname;

const links = [...document.querySelectorAll(`a[href*="${domain}"]`)];
const uniquePageUrls = new Set(links.map((link) => link.href.split('?')[0]));

const CONFIG = {
  MAX_CONCURRENT_TABS: 5,
  MAX_CHECKS: 5,
  CHECK_INTERVAL: 2000,
  BLACKLIST_KEYWORDS: ['hybrides-rechargeables'],
};

const hasGA4Script = (content) =>
  /<script[^>]*src="[^"]*gtag\.js[^>"]*"><\/script>/.test(content);

const checkGA4 = async (url) => {
  return new Promise((resolve) => {
    let tab;
    let checks = 0;

    const checkForGTag = () => {
      checks++;
      const hasGA4 =
        Boolean(tab.window.gtag) ||
        hasGA4Script(tab.document.documentElement.innerHTML);
      if (hasGA4 || checks >= CONFIG.MAX_CHECKS) {
        tab.close();
        resolve({ url, hasGA4 });
      } else {
        setTimeout(checkForGTag, CONFIG.CHECK_INTERVAL);
      }
    };

    const onError = (event) => {
      tab.close();
      const errorType =
        event.target.location.href === url && event.target.status === 0
          ? 'ERR_TOO_MANY_REDIRECTS'
          : 'Unknown error';
      resolve({ url, error: errorType });
    };

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url, active: false }, (newTab) => {
        const tabId = newTab.id;
        chrome.tabs.onUpdated.addListener((updatedTabId, changeInfo) => {
          if (updatedTabId === tabId && changeInfo.status === 'complete') {
            setTimeout(checkForGTag, CONFIG.CHECK_INTERVAL);
          }
        });
      });
    } else {
      tab = window.open(url, '_blank');
      tab.addEventListener('load', () =>
        setTimeout(checkForGTag, CONFIG.CHECK_INTERVAL),
      );
      tab.addEventListener('error', onError);
    }
  });
};

const processPagesInBatches = async (remainingPages, gaReport) => {
  if (!remainingPages.size) return gaReport;

  const batch = [];
  for (let url of remainingPages) {
    if (batch.length >= CONFIG.MAX_CONCURRENT_TABS) break;
    if (!CONFIG.BLACKLIST_KEYWORDS.some((keyword) => url.includes(keyword))) {
      batch.push(url);
      remainingPages.delete(url);
    }
  }

  const results = await Promise.all(batch.map(checkGA4));

  results.forEach((result) => {
    const { url, hasGA4, error } = result;
    gaReport.allPages.push(url);

    if (hasGA4) {
      gaReport.pagesWithTag.push(url);
      if (url.includes('tda')) gaReport.pagesWithTagTDA.push(url);
      if (url.includes('rfo') && !url.includes('performance'))
        gaReport.pagesWithTagRFO.push(url);
    } else if (error) {
      gaReport.errors.push(`Error processing page "${url}": ${error}`);
    } else {
      gaReport.pagesNoTag.push(url);
    }
  });

  return processPagesInBatches(remainingPages, gaReport);
};

const processPages = async (pages) => {
  const gaReport = {
    allPages: [],
    pagesWithTag: [],
    pagesNoTag: [],
    pagesWithTagRFO: [],
    pagesWithTagTDA: [],
    errors: [],
  };

  await processPagesInBatches(pages, gaReport);

  try {
    sessionStorage.setItem('gaReport', JSON.stringify(gaReport));
    console.log('GA report has been stored in Session Storage.');
  } catch (error) {
    gaReport.errors.push(
      `Error storing GA report in Session Storage: ${error}`,
    );
  }

  return gaReport;
};

processPages(uniquePageUrls).then((report) => {
  console.log('Finished processing all pages:', report);
});
