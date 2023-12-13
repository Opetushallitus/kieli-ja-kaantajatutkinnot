import { CustomTable, H2, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { PublicEvaluationPeriodListingHeader } from 'components/reassessment/PublicEvaluationPeriodListingHeader';
import { PublicEvaluationPeriodListingRow } from 'components/reassessment/PublicEvaluationPeriodListingRow';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';
import { evaluationPeriodsSelector } from 'redux/selectors/evaluationPeriods';

const getRowDetails = (evaluationPeriod: EvaluationPeriod) => {
  return (
    <PublicEvaluationPeriodListingRow evaluationPeriod={evaluationPeriod} />
  );
};

export const PublicEvaluationPeriodListing = () => {
  const { evaluation_periods } = useAppSelector(evaluationPeriodsSelector);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.publicEvaluationPeriodListing',
  });
  const { isPhone } = useWindowProperties();

  if (evaluation_periods.length > 0) {
    return (
      <>
        <H2>{t('heading')}</H2>
        <CustomTable
          className=""
          header={isPhone ? undefined : <PublicEvaluationPeriodListingHeader />}
          data={evaluation_periods}
          getRowDetails={getRowDetails}
          stickyHeader
        />
      </>
    );
  } else {
    return (
      <div className="rows gapped">
        <H2>{t('noResults.heading')}</H2>
        <Text>{t('noResults.description')}</Text>
      </div>
    );
  }
};
