type MockPaymentWindow = Pick<Window, 'document' | 'fetch'> & {
  location: Pick<Location, 'origin' | 'assign'>;
};

// MSW handles fetches, not document navigation. Keep the mock page alive until
// the payment handler stores the result, then follow its simulated redirect.
export const enableMockPaymentNavigation = (win: MockPaymentWindow) => {
  let pending = false;
  const onClick = async (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>(
      'a[href]',
    );
    if (!anchor) return;
    const url = new URL(anchor.href);
    if (
      url.origin !== win.location.origin ||
      !/^\/yki\/api\/v2\/exam-session\/\d+\/registration\/\d+\/mock-payment$/.test(
        url.pathname,
      )
    )
      return;

    event.preventDefault();
    if (pending) return;
    pending = true;
    try {
      const response = await win.fetch(url.href);
      if (!response.ok)
        throw new Error(`Mock payment failed (${response.status})`);
      const { redirect_url } = await response.json();
      win.location.assign(redirect_url);
    } catch (error) {
      // Mock-only diagnostics; leave the page available for another attempt.
      // eslint-disable-next-line no-console
      console.error('Could not complete the mock payment', error);
    } finally {
      pending = false;
    }
  };
  win.document.addEventListener('click', onClick);

  return () => win.document.removeEventListener('click', onClick);
};
