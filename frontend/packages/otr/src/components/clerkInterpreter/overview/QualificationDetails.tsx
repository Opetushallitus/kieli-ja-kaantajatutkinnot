import { Add as AddIcon } from '@mui/icons-material';
import { useState } from 'react';
import { CustomButton, H3, Text, ToggleFilterGroup } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { QualificationListing } from 'components/clerkInterpreter/overview/QualificationListing';
import { useAppTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { QualificationStatus } from 'enums/clerkInterpreter';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { QualificationUtils } from 'utils/qualifications';

export const QualificationDetails = () => {
  // State
  const [selectedToggleFilter, setSelectedToggleFilter] = useState(
    QualificationStatus.Effective
  );

  // Redux
  const { interpreter } = useAppSelector(clerkInterpreterOverviewSelector);

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview.qualifications',
  });

  if (!interpreter) {
    return null;
  }

  const { effective, expired } =
    QualificationUtils.groupClerkInterpreterQualificationsByStatus(
      interpreter as ClerkInterpreter
    );

  const groupedQualifications = {
    [QualificationStatus.Effective]: effective,
    [QualificationStatus.Expired]: expired,
  };

  const activeQualifications = groupedQualifications[selectedToggleFilter];
  const toggleFilters = [
    {
      status: QualificationStatus.Effective,
      count: groupedQualifications.effective.length,
      testId: `clerk-interpreter-overview__qualification-details__toggle-button--${QualificationStatus.Effective}`,
      label: t('toggleFilters.effective'),
    },
    {
      status: QualificationStatus.Expired,
      count: groupedQualifications.expired.length,
      testId: `clerk-interpreter-overview__qualification-details___toggle-button--${QualificationStatus.Expired}`,
      label: t('toggleFilters.expired'),
    },
  ];

  const filterByQualificationStatus = (status: QualificationStatus) => {
    setSelectedToggleFilter(status);
  };

  return (
    <div className="rows gapped-xs">
      <div className="columns margin-top-sm">
        <H3 className="grow">{t('header')}</H3>
      </div>
      <div className="columns margin-top-sm space-between">
        <ToggleFilterGroup
          filters={toggleFilters}
          activeStatus={selectedToggleFilter}
          onButtonClick={filterByQualificationStatus}
        />
        <CustomButton
          data-testid="clerk-interpreter-overview__qualifications-details__add-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          startIcon={<AddIcon />}
          onClick={() => {
            return;
          }}
        >
          {t('buttons.add')}
        </CustomButton>
      </div>
      {activeQualifications.length ? (
        <QualificationListing
          qualifications={activeQualifications}
          permissionToPublishReadOnly={false}
        />
      ) : (
        <Text className="centered bold margin-top-lg">
          {t('noQualifications')}
        </Text>
      )}
    </div>
  );
};
