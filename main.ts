// Get the current domain
const domain: string = window.location.hostname;

// Fetch all the anchor tags on the page
const links: HTMLAnchorElement[] = Array.from(document.getElementsByTagName('a'));

// Filter links to include only the main domain
const mainDomainLinks: HTMLAnchorElement[] = links.filter((link: HTMLAnchorElement) => {
  const href: string | null = link.getAttribute('href');
  return href && href.indexOf(domain) !== -1;
});

// Extract unique page URLs from main domain links using a Set
const pagesSet: Set<string> = new Set(mainDomainLinks.map((link: HTMLAnchorElement) => link.href.split('?')[0]));

// Convert Set to an array of pages
const pages: string[] = Array.from(pagesSet);

// Function to open a new tab and check for GA4 snippet
const checkGA4 = async (url: string): Promise<{ url: string, hasGA4: boolean, error?: string }> => {
  return new Promise((resolve) => {
    const tab: Window | null = window.open(url, '_blank');
    if (!tab) {
      resolve({ url, hasGA4: false, error: 'Failed to open new tab.' });
      return;
    }

    tab.addEventListener('load', () => {
      setTimeout(() => {
        const hasGA4: boolean = Boolean(tab.window.gtag);
        tab.close();
        resolve({ url, hasGA4 });
      }, 1000);
    });

    tab.addEventListener('error', (event) => {
      if (event.target && event.target.location.href === url && event.target.status === 0) {
        resolve({ url, hasGA4: false, error: 'ERR_TOO_MANY_REDIRECTS' });
      }
    });
  });
};

// Process each page sequentially and store GA4 presence report
const processPages = async (pages: string[]): Promise<void> => {
  const gaReport: {
    allPages: Record<number, string>,
    pagesWithTag: Record<number, string>,
    pagesNoTag: Record<number, string>,
    pagesWithTagRFO: Record<number, string>,
    pagesWithTagTDA: Record<number, string>,
    errors: string[],
  } = {
    allPages: {},
    pagesWithTag: {},
    pagesNoTag: {},
    pagesWithTagRFO: {},
    pagesWithTagTDA: {},
    errors: [],
  };

  const blacklistKeyword: string = 'hybrides-rechargeables'; // Blacklist keyword

  let pageIndex: number = 1;

  async function processNextPage(): Promise<void> {
    if (pages.length === 0) {
      try {
        sessionStorage.setItem('gaReport', JSON.stringify(gaReport));
        console.log('GA report has been stored in Session Storage.');
      } catch (error) {
        gaReport.errors.push(`Error storing GA report in Session Storage: ${error}`);
      }
      return;
    }

    const nextPage: string | undefined = pages.shift();
    if (nextPage && nextPage.includes(blacklistKeyword)) {
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
