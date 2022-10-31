import { FC } from 'react';
import { ExtLink, H1, H2 } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';

export const StatisticsPage: FC = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.pages.statisticsPage',
  });

  return (
    <div className="statistics-page">
      <H1>{t('title')}</H1>
      <H2>{t('contactRequests')}</H2>
      <div className="rows gapped">
        <ExtLink
          href={APIEndpoints.StatisticsContactRequestsYearly}
          text={t('yearly')}
        />
        <ExtLink
          href={APIEndpoints.StatisticsContactRequestsMonthly}
          text={t('monthly')}
        />
        <ExtLink
          href={APIEndpoints.StatisticsContactRequestsDaily}
          text={t('daily')}
        />
      </div>

      <H2>{t('emails')}</H2>
      <div className="rows gapped">
        <ExtLink
          href={APIEndpoints.StatisticsEmailsYearly}
          text={t('yearly')}
        />
        <ExtLink
          href={APIEndpoints.StatisticsEmailsMonthly}
          text={t('monthly')}
        />
        <ExtLink href={APIEndpoints.StatisticsEmailsDaily} text={t('daily')} />
      </div>
    </div>
  );
};
