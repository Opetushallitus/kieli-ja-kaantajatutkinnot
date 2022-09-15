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

import { AddAuthorisation } from 'components/clerkTranslator/add/AddAuthorisation';
import { AuthorisationListing } from 'components/clerkTranslator/overview/AuthorisationListing';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { Authorisation } from 'interfaces/authorisation';
import {
  addAuthorisation,
  removeAuthorisation,
  resetAuthorisationAdd,
  resetAuthorisationPublishPermissionUpdate,
  resetAuthorisationRemove,
  updateAuthorisationPublishPermission,
} from 'redux/reducers/authorisation';
import { loadExaminationDates } from 'redux/reducers/examinationDate';
import { loadMeetingDates } from 'redux/reducers/meetingDate';
import { authorisationSelector } from 'redux/selectors/authorisation';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';
import { selectExaminationDatesByStatus } from 'redux/selectors/examinationDate';
import { selectMeetingDatesByMeetingStatus } from 'redux/selectors/meetingDate';

export const AuthorisationDetails = () => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.authorisations',
  });
  const translateCommon = useCommonTranslation();

  // State
  const [selectedToggleFilter, setSelectedToggleFilter] = useState(
    AuthorisationStatus.Effective
  );
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const { showDialog } = useDialog();
  const { showToast } = useToast();

  // Redux
  const { addStatus, removeStatus, updatePublishPermissionStatus } =
    useAppSelector(authorisationSelector);
  const { translator } = useAppSelector(clerkTranslatorOverviewSelector);
  const passedMeetingDates = useAppSelector(
    selectMeetingDatesByMeetingStatus
  ).passed;
  const examinationDates = useAppSelector(selectExaminationDatesByStatus);
  const passedExaminationDates = examinationDates.passed;

  const dispatch = useAppDispatch();

  const handleAddAuthorisation = (authorisation: Authorisation) => {
    dispatch(addAuthorisation(authorisation));
  };

  useEffect(() => {
    if (addStatus === APIResponseStatus.Success) {
      handleCloseModal();
      showToast({
        severity: Severity.Success,
        description: t('toasts.addingSucceeded'),
      });
    }

    if (
      addStatus === APIResponseStatus.Success ||
      addStatus === APIResponseStatus.Error
    ) {
      dispatch(resetAuthorisationAdd());
    }
  }, [dispatch, addStatus, showToast, t]);

  useEffect(() => {
    if (removeStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.removingSucceeded'),
      });
    }

    if (
      removeStatus === APIResponseStatus.Success ||
      removeStatus === APIResponseStatus.Error
    ) {
      dispatch(resetAuthorisationRemove());
    }
  }, [dispatch, removeStatus, showToast, t]);

  useEffect(() => {
    if (updatePublishPermissionStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.updatingPublishPermissionSucceeded'),
      });
    }

    if (
      updatePublishPermissionStatus === APIResponseStatus.Success ||
      updatePublishPermissionStatus === APIResponseStatus.Error
    ) {
      dispatch(resetAuthorisationPublishPermissionUpdate());
    }
  }, [dispatch, updatePublishPermissionStatus, showToast, t]);

  useEffect(() => {
    dispatch(loadMeetingDates());
    dispatch(loadExaminationDates());
  }, [dispatch]);

  if (!translator) {
    return null;
  }

  const { effective, expiring, expired, expiredDeduplicated, formerVir } =
    translator.authorisations;

  const groupedAuthorisations = {
    [AuthorisationStatus.Effective]: effective,
    [AuthorisationStatus.Expiring]: expiring,
    [AuthorisationStatus.Expired]: expired,
    [AuthorisationStatus.ExpiredDeduplicated]: expiredDeduplicated,
    [AuthorisationStatus.FormerVir]: formerVir,
  };

  const activeAuthorisations = groupedAuthorisations[selectedToggleFilter];
  const toggleFilters = [
    {
      status: AuthorisationStatus.Effective,
      count: groupedAuthorisations.effective.length,
      testId: `clerk-translator-overview__authorisation-details__toggle-btn--${AuthorisationStatus.Effective}`,
      label: t('toggleFilters.effective'),
    },
    {
      status: AuthorisationStatus.Expired,
      count: groupedAuthorisations.expired.length,
      testId: `clerk-translator-overview__authorisation-details__toggle-btn--${AuthorisationStatus.Expired}`,
      label: t('toggleFilters.expired'),
    },
    {
      status: AuthorisationStatus.FormerVir,
      count: groupedAuthorisations.formerVir.length,
      testId: `clerk-translator-overview__authorisation-details__toggle-btn--${AuthorisationStatus.FormerVir}`,
      label: t('toggleFilters.formerVir'),
    },
  ];

  const onPermissionToPublishChange = (authorisation: Authorisation) => {
    showDialog({
      title: t('actions.changePermissionToPublish.dialog.header'),
      severity: Severity.Info,
      description: t('actions.changePermissionToPublish.dialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => {
            dispatch(
              updateAuthorisationPublishPermission({
                ...authorisation,
                permissionToPublish: !authorisation.permissionToPublish,
              })
            );
          },
        },
      ],
    });
  };

  const onAuthorisationRemove = (authorisation: Authorisation) => {
    showDialog({
      title: t('actions.removal.dialog.header'),
      severity: Severity.Info,
      description: t('actions.removal.dialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: t('actions.removal.dialog.confirmButton'),
          variant: Variant.Contained,
          action: () => {
            dispatch(removeAuthorisation(authorisation.id as number));
          },
          buttonColor: Color.Error,
        },
      ],
    });
  };

  const filterByAuthorisationStatus = (status: AuthorisationStatus) => {
    setSelectedToggleFilter(status);
  };

  return (
    <>
      <CustomModal
        data-testid="authorisation-details__add-authorisation-modal"
        open={open}
        onCloseModal={handleCloseModal}
        ariaLabelledBy="modal-title"
        modalTitle={translateCommon('addAuthorisation')}
      >
        <AddAuthorisation
          translatorId={translator.id}
          meetingDates={passedMeetingDates}
          examinationDates={passedExaminationDates}
          onAuthorisationAdd={handleAddAuthorisation}
          onCancel={handleCloseModal}
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
            onButtonClick={filterByAuthorisationStatus}
          />
          <CustomButton
            data-testid="clerk-translator-overview__authorisation-details__add-btn"
            variant={Variant.Contained}
            color={Color.Secondary}
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            {translateCommon('addAuthorisation')}
          </CustomButton>
        </div>
        {activeAuthorisations.length ? (
          <AuthorisationListing
            authorisations={activeAuthorisations}
            permissionToPublishReadOnly={false}
            onAuthorisationRemove={onAuthorisationRemove}
            onPermissionToPublishChange={onPermissionToPublishChange}
          />
        ) : (
          <Text className="centered bold margin-top-lg">
            {t('noAuthorisations')}
          </Text>
        )}
      </div>
    </>
  );
};
