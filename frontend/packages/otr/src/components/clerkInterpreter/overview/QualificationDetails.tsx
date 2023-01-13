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
import { useDialog, useToast } from 'shared/hooks';

import { AddQualification } from 'components/clerkInterpreter/add/AddQualification';
import { QualificationListing } from 'components/clerkInterpreter/overview/QualificationListing';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { QualificationStatus } from 'enums/clerkInterpreter';
import { Qualification } from 'interfaces/qualification';
import { loadMeetingDates } from 'redux/reducers/meetingDate';
import {
  addQualification,
  removeQualification,
  resetQualificationState,
} from 'redux/reducers/qualification';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { selectMeetingDatesByMeetingStatus } from 'redux/selectors/meetingDate';
import { qualificationSelector } from 'redux/selectors/qualification';

export const QualificationDetails = () => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview.qualifications',
  });
  const translateCommon = useCommonTranslation();

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
  const { addStatus, updateStatus, removeStatus } = useAppSelector(
    qualificationSelector
  );
  const passedMeetingDates = useAppSelector(
    selectMeetingDatesByMeetingStatus
  ).passed;

  const { showDialog } = useDialog();
  const { showToast } = useToast();

  useEffect(() => {
    if (addStatus === APIResponseStatus.Success) {
      handleCloseModal();
      showToast({
        severity: Severity.Success,
        description: t('toasts.addingSucceeded'),
      });
    }
  }, [dispatch, addStatus, showToast, t]);

  useEffect(() => {
    if (removeStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.removingSucceeded'),
      });
    }
  }, [dispatch, removeStatus, showToast, t]);

  useEffect(() => {
    if (updateStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.updatingPublishPermissionSucceeded'),
      });
    }
  }, [dispatch, updateStatus, showToast, t]);

  useEffect(() => {
    dispatch(loadMeetingDates());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetQualificationState());
    };
  }, [dispatch]);

  if (!interpreter) {
    return null;
  }

  const { effective, expiring, expired, expiredDeduplicated } =
    interpreter.qualifications;

  const groupedQualifications = {
    [QualificationStatus.Effective]: effective,
    [QualificationStatus.Expiring]: expiring,
    [QualificationStatus.Expired]: expired,
    [QualificationStatus.ExpiredDeduplicated]: expiredDeduplicated,
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
    showDialog({
      title: t('actions.removal.dialog.header'),
      severity: Severity.Warning,
      description: t('actions.removal.dialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: t('actions.removal.dialog.confirmButton'),
          variant: Variant.Contained,
          action: () =>
            dispatch(removeQualification(qualification.id as number)),
          buttonColor: Color.Error,
        },
      ],
    });
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
