import { waitFor } from '@testing-library/react';

import { enableMockPaymentNavigation } from 'tests/msw/paymentNavigation';

const paymentUrl = '/yki/api/v2/exam-session/11/registration/502/mock-payment';
const doneUrl = '/yki/ilmoittautuminen/valmis/tutkintotilaisuus/11/502';
let stop: () => void;
const setup = () => {
  const win = {
    document,
    location: { origin: window.location.origin, assign: jest.fn() },
    fetch: jest.fn(),
  };
  stop = enableMockPaymentNavigation(win);

  return win;
};
const click = (href: string) => {
  document.body.innerHTML = `<a href="${href}"><button><span>Pay</span></button></a>`;
  let intercepted = false;
  // Observe the helper, then prevent jsdom's default navigation for other links.
  document.addEventListener(
    'click',
    (event) => {
      intercepted = event.defaultPrevented;
      event.preventDefault();
    },
    { once: true },
  );
  document
    .querySelector('span')!
    .dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );

  return intercepted;
};
afterEach(() => {
  stop();
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

it('fetches the clicked mock payment and follows its successful redirect', async () => {
  const win = setup();
  win.fetch.mockResolvedValue(
    new Response(JSON.stringify({ redirect_url: doneUrl })),
  );
  expect(click(paymentUrl)).toBe(true);
  expect(win.fetch).toHaveBeenCalledWith(window.location.origin + paymentUrl);
  await waitFor(() =>
    expect(win.location.assign).toHaveBeenCalledWith(doneUrl),
  );
});

it.each([
  '/yki/ilmoittautuminen',
  '/yki/api/payment/502',
  'https://payments.example.invalid' + paymentUrl,
])('leaves other links to normal navigation: %s', (url) => {
  const win = setup();
  expect(click(url)).toBe(false);
  expect(win.fetch).not.toHaveBeenCalled();
  expect(win.location.assign).not.toHaveBeenCalled();
});

it('sends only one payment request while the first click is pending', async () => {
  const win = setup();
  let resolve!: (response: Response) => void;
  win.fetch.mockReturnValue(
    new Promise<Response>((done) => {
      resolve = done;
    }),
  );
  click(paymentUrl);
  click(paymentUrl);
  expect(win.fetch).toHaveBeenCalledTimes(1);
  resolve(new Response(JSON.stringify({ redirect_url: doneUrl })));
  await waitFor(() => expect(win.location.assign).toHaveBeenCalledTimes(1));
});

it('stays on payment after an HTTP failure and permits another click', async () => {
  const win = setup();
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  win.fetch
    .mockResolvedValueOnce(new Response(null, { status: 500 }))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ redirect_url: doneUrl })),
    );
  click(paymentUrl);
  await waitFor(() => expect(error).toHaveBeenCalled());
  expect(win.location.assign).not.toHaveBeenCalled();
  click(paymentUrl);
  await waitFor(() =>
    expect(win.location.assign).toHaveBeenCalledWith(doneUrl),
  );
});
