import { H3, NormalTable } from 'shared/components';

import { PublicEvaluationPeriodListingHeader } from 'components/reassessment/PublicEvaluationPeriodListingHeader';
import { PublicEvaluationPeriodListingRow } from 'components/reassessment/PublicEvaluationPeriodListingRow';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';
import { evaluationPeriodsSelector } from 'redux/selectors/evaluationPeriod';

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

  return (
    <>
      <H3>{t('heading')}</H3>
      <NormalTable
        className=""
        header={<PublicEvaluationPeriodListingHeader />}
        data={evaluation_periods}
        getRowDetails={getRowDetails}
        stickyHeader
      />
    </>
  );
};
