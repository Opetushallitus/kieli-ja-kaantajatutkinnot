import { Dayjs } from 'dayjs';

export const useFixedDate = (date: Dayjs) => cy.clock(date.toDate());
