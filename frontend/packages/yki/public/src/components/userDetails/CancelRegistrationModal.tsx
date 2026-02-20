import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from '@mui/material';
import { useCallback, useEffect } from 'react';
import {
  CustomButton,
  CustomModal,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useToast, useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PersonRegistrations } from 'interfaces/userDetails';
import {
  cancelUserRegistration,
  loadPersonDetails,
  resetCancelRegistrationStatus,
  setRegistrationToCancel,
} from 'redux/reducers/userDetails';
import { userDetailsSelector } from 'redux/selectors/userDetails';

type CancelRegistrationModalProps = {
  registrationToCancel: PersonRegistrations;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
};

export const CancelRegistrationModal = ({
  registrationToCancel,
  modalOpen,
  setModalOpen,
}: CancelRegistrationModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.cancelRegistrationModal',
  });
  const translateCommon = useCommonTranslation();

  const { cancelUserRegistrationStatus } = useAppSelector(userDetailsSelector);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const isLoading =
    cancelUserRegistrationStatus === APIResponseStatus.InProgress;
  const { isPhone } = useWindowProperties();

  const cancel = useCallback(() => {
    dispatch(cancelUserRegistration(registrationToCancel.id));
  }, [dispatch, registrationToCancel.id]);

  useEffect(() => {
    const onSuccess = () => {
      showToast({
        severity: Severity.Success,
        description: t('success'),
      });
    };

    const onError = () => {
      showToast({
        severity: Severity.Error,
        description: translateCommon('error'),
      });
    };

    if (cancelUserRegistrationStatus === APIResponseStatus.Success) {
      onSuccess();
      setModalOpen(false);
      dispatch(resetCancelRegistrationStatus());
      dispatch(setRegistrationToCancel(undefined));
      dispatch(loadPersonDetails());
    } else if (cancelUserRegistrationStatus === APIResponseStatus.Error) {
      onError();
      dispatch(resetCancelRegistrationStatus());
    }
  }, [
    cancelUserRegistrationStatus,
    dispatch,
    setModalOpen,
    showToast,
    t,
    translateCommon,
  ]);

  useEffect(() => {
    if (modalOpen && registrationToCancel) {
      dispatch(setRegistrationToCancel(registrationToCancel));
    }
  }, [dispatch, modalOpen, registrationToCancel]);

  return (
    <CustomModal
      className="cancel-registration-modal"
      open={modalOpen}
      modalTitle={t('title')}
      onCloseModal={() => setModalOpen(false)}
    >
      <div className="rows gapped">
        <div className="rows gapped">
          {registrationToCancel.isFreeRegistration && (
            <div className="rows gapped">
              <Text>{t('descriptionNotPaid1')}</Text>
              <Text>{t('descriptionNotPaid2')}</Text>
            </div>
          )}
          {!registrationToCancel.isFreeRegistration && (
            <div className="rows gapped">
              <Text>{t('descriptionPaid1')}</Text>
              <Text>
                {t('descriptionPaid2')}{' '}
                <div className="columns gapped-xs">
                  <Link href={t('link.url')}>
                    <Text color="secondary">{t('link.label')}</Text>
                  </Link>
                  <OpenInNewIcon color="secondary" />
                </div>
              </Text>
              <Text>{t('descriptionPaid3')}</Text>
            </div>
          )}
          <div
            className={`${
              isPhone ? 'rows' : 'columns'
            } gapped flex-end margin-top-sm`}
          >
            <CustomButton
              variant={Variant.Outlined}
              color={Color.Secondary}
              onClick={() => setModalOpen(false)}
            >
              {t('cancel')}
            </CustomButton>
            <LoadingProgressIndicator isLoading={isLoading}>
              <CustomButton
                className="grow"
                variant={Variant.Contained}
                color={Color.Secondary}
                onClick={cancel}
                disabled={isLoading}
              >
                {t('confirm')}
              </CustomButton>
            </LoadingProgressIndicator>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};
