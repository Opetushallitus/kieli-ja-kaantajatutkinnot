import dayjs, { Dayjs } from 'dayjs';

export const fixedDateForTests = dayjs('2022-09-27T16:00:00+0200');

// @ts-expect-error Cy global is present in tests
export const useFixedDate = (date: Dayjs) => cy.clock(date.toDate());
