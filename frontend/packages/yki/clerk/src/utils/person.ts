import dayjs from 'dayjs';

export const formatPersonIdentifier = (
  ssn?: string | null,
  birthdate?: string | null,
): string => {
  if (ssn) return ssn;
  if (!birthdate) return '';
  const date = dayjs(birthdate);

  return date.isValid() && date.format('YYYY-MM-DD') === birthdate
    ? date.format('D.M.YYYY')
    : '';
};
