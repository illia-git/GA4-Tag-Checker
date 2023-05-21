// Get the current domain
const domain = window.location.hostname;

// Fetch all the anchor tags on the page
const links = Array.from(document.getElementsByTagName('a'));

// Filter links to include only the main domain
const mainDomainLinks = links.filter((link) => {
  const href = link.getAttribute('href');
  return href && href.indexOf(domain) !== -1;
});

// Extract unique page URLs from main domain links using a Set
const pagesSet = new Set(mainDomainLinks.map((link) => link.href.split('?')[0]));

// Convert Set to an array of pages
const pages = Array.from(pagesSet);

// Function to open a new tab and check for GA4 snippet
const checkGA4 = async (url) => {
  return new Promise((resolve) => {
    const tab = window.open(url, '_blank');

    tab.addEventListener('load', () => {
      setTimeout(() => {
        const hasGA4 = Boolean(tab.window.gtag);
        tab.close();
        resolve({ url, hasGA4 });
      }, 1000);
    });

    tab.addEventListener('error', (event) => {
      if (event.target.location.href === url && event.target.status === 0) {
        resolve({ url, error: 'ERR_TOO_MANY_REDIRECTS' });
      }
    });
  });
};

// Process each page sequentially and store GA4 presence report
const processPages = async (pages) => {
  const gaReport = {
    allPages: {},
    pagesWithTag: {},
    pagesNoTag: {},
    pagesWithTagRFO: {},
    pagesWithTagTDA: {},
    errors: [],
  };

  const blacklistKeyword = 'hybrides-rechargeables'; // Blacklist keyword

  let pageIndex = 1;

  async function processNextPage() {
    if (pages.length === 0) {
      try {
        sessionStorage.setItem('gaReport', JSON.stringify(gaReport));
        console.log('GA report has been stored in Session Storage.');
      } catch (error) {
        gaReport.errors.push(`Error storing GA report in Session Storage: ${error}`);
      }
      return;
    }

    const nextPage = pages.shift();
    if (nextPage.includes(blacklistKeyword)) {
      processNextPage();
      return;
    }

    try {
      const result = await checkGA4(nextPage);

      gaReport.allPages[pageIndex] = nextPage;

      if (result.hasGA4) {
        gaReport.pagesWithTag[pageIndex] = nextPage;

        if (nextPage.includes('tda')) {
          gaReport.pagesWithTagTDA[pageIndex] = nextPage;
        }

        if (nextPage.includes('rfo') && !nextPage.includes('performance')) {
          gaReport.pagesWithTagRFO[pageIndex] = nextPage;
        }
      } else {
        gaReport.pagesNoTag[pageIndex] = nextPage;
      }

      pageIndex++;
    } catch (error) {
      if (error === 'ERR_TOO_MANY_REDIRECTS') {
        gaReport.errors.push(`Error processing page "${nextPage}": Too many redirects.`);
      } else {
        gaReport.errors.push(`Error processing page "${nextPage}": ${error}`);
      }
    }

    processNextPage();
  }

  await processNextPage();
};

// Start processing the pages
processPages(pages);
