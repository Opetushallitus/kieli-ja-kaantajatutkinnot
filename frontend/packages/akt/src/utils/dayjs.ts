import dayjs from 'dayjs';

import { getCurrentLang } from 'configs/i18n';

export const getDayjs = () => {
  dayjs.locale(getCurrentLang());

  return dayjs;
};
