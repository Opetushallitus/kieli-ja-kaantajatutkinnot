import { Add as AddIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import {
  CustomButton,
  CustomModal,
  H3,
  Text,
  ToggleFilterGroup,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';

import { AddQualification } from 'components/clerkInterpreter/add/AddQualification';
import { QualificationListing } from 'components/clerkInterpreter/overview/QualificationListing';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { QualificationStatus } from 'enums/clerkInterpreter';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import { Qualification } from 'interfaces/qualification';
import { loadMeetingDates } from 'redux/reducers/meetingDate';
import {
  removeNotifierDialog,
  showNotifierDialog,
} from 'redux/reducers/notifier';
import {
  addQualification,
  removeQualification,
} from 'redux/reducers/qualification';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { selectMeetingDatesByMeetingStatus } from 'redux/selectors/meetingDate';
import { qualificationSelector } from 'redux/selectors/qualification';
import { NotifierUtils } from 'utils/notifier';
import { QualificationUtils } from 'utils/qualifications';

export const QualificationDetails = () => {
  // State
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);
  const [selectedToggleFilter, setSelectedToggleFilter] = useState(
    QualificationStatus.Effective
  );

  // Redux
  const dispatch = useAppDispatch();
  const { interpreter } = useAppSelector(clerkInterpreterOverviewSelector);
  const { addStatus } = useAppSelector(qualificationSelector);
  const passedMeetingDates = useAppSelector(
    selectMeetingDatesByMeetingStatus
  ).passed;

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview.qualifications',
  });
  const translateCommon = useCommonTranslation();

  useEffect(() => {
    if (addStatus === APIResponseStatus.Success) {
      handleCloseModal();
    }
  }, [addStatus]);

  useEffect(() => {
    dispatch(loadMeetingDates());
  }, [dispatch]);

  if (!interpreter) {
    return null;
  }

  const { effective, expired } = QualificationUtils.getQualificationsByStatus(
    interpreter as ClerkInterpreter
  );

  const groupedQualifications = {
    [QualificationStatus.Effective]: effective,
    [QualificationStatus.Expired]: expired,
    [QualificationStatus.Expiring]: [],
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
      testId: `clerk-interpreter-overview__qualification-details__toggle-button--${QualificationStatus.Expired}`,
      label: t('toggleFilters.expired'),
    },
  ];

  const filterByQualificationStatus = (status: QualificationStatus) => {
    setSelectedToggleFilter(status);
  };

  const handleAddQualification = (qualification: Qualification) => {
    dispatch(addQualification(qualification));
  };

  const handleRemoveQualification = (qualification: Qualification) => {
    const notifier = NotifierUtils.createNotifierDialog(
      t('actions.removal.dialog.header'),
      Severity.Info,
      t('actions.removal.dialog.description'),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
          action: () => dispatch(removeNotifierDialog(notifier.id)),
        },
        {
          title: t('actions.removal.dialog.confirmButton'),
          variant: Variant.Contained,
          action: () =>
            dispatch(removeQualification(qualification.id as number)),
          buttonColor: Color.Error,
        },
      ]
    );

    dispatch(showNotifierDialog(notifier));
  };

  return (
    <>
      <CustomModal
        data-testid="qualification-details__add-qualification-modal"
        open={open}
        onCloseModal={handleCloseModal}
        ariaLabelledBy="modal-title"
        modalTitle={translateCommon('addQualification')}
      >
        <AddQualification
          interpreterId={interpreter.id}
          meetingDates={passedMeetingDates}
          onCancel={handleCloseModal}
          onQualificationAdd={handleAddQualification}
          isLoading={addStatus === APIResponseStatus.InProgress}
        />
      </CustomModal>
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
            data-testid="clerk-interpreter-overview__qualification-details__add-button"
            variant={Variant.Contained}
            color={Color.Secondary}
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            {translateCommon('addQualification')}
          </CustomButton>
        </div>
        {activeQualifications.length ? (
          <QualificationListing
            qualifications={activeQualifications}
            permissionToPublishReadOnly={false}
            handleRemoveQualification={handleRemoveQualification}
          />
        ) : (
          <Text className="centered bold margin-top-lg">
            {t('noQualifications')}
          </Text>
        )}
      </div>
    </>
  );
};
