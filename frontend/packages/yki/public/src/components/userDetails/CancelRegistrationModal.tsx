import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { IconButton, Typography } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { Trans } from 'react-i18next';
import {
  CustomButton,
  CustomModal,
  LoadingProgressIndicator,
  WebLink,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useToast, useWindowProperties } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { H2, Text } from 'components/Text';
import { ExamPayment } from 'components/userDetails/ExamPayment';
import { RegistrationDetails } from 'components/userDetails/RegistrationDetails';
import { RegistrationState } from 'components/userDetails/RegistrationState';
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
      aria-labelledby="cancel-registration-modal-title"
      modalTitle={
        <div className="cancel-registration-modal__header">
          <H2 id="cancel-registration-modal-title">
            {t('title', {
              language: translateCommon(
                `languages.${registrationToCancel.examLang}`,
              ),
              level: translateCommon(
                `languageLevel.${registrationToCancel.examLevel}`,
              ),
              date: DateUtils.formatOptionalDate(
                registrationToCancel.examDate,
                'l',
              ),
            })}
          </H2>
          <IconButton
            aria-label={t('close')}
            onClick={() => setModalOpen(false)}
            sx={{ flexShrink: 0 }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      }
      onCloseModal={() => setModalOpen(false)}
    >
      <div className="rows gapped">
        <div className="rows gapped">
          <div className="cancel-registration-modal__registration rows gapped-sm">
            <RegistrationState registration={registrationToCancel} />
            <ExamPayment registration={registrationToCancel} />
            <RegistrationDetails registration={registrationToCancel} />
          </div>
          {registrationToCancel.isFreeRegistration && (
            <div className="rows gapped">
              <Text>{t('descriptionNotPaid1')}</Text>
              <Text>{t('descriptionNotPaid2')}</Text>
            </div>
          )}
          {!registrationToCancel.isFreeRegistration && (
            <div className="rows gapped">
              <Text>{t('descriptionPaid.notPaidYet')}</Text>
              <Text>
                <Trans t={t} i18nKey="descriptionPaid.alreadyPaid" />
              </Text>
              <div>
                <Text>
                  <Trans t={t} i18nKey="descriptionPaid.refundOnlyIf" />
                </Text>
                <ul>
                  <Typography variant="body1" component="li">
                    <Trans
                      t={t}
                      i18nKey="descriptionPaid.refundConditions.ill"
                    />
                  </Typography>
                  <Typography variant="body1" component="li">
                    <Trans
                      t={t}
                      i18nKey="descriptionPaid.refundConditions.cancelledInTime"
                    />
                  </Typography>
                  <Typography variant="body1" component="li">
                    <Trans
                      t={t}
                      i18nKey="descriptionPaid.refundConditions.applyInTime"
                      components={{
                        RefundLink: (
                          <WebLink
                            href={t('link.url')}
                            label={t('link.label')}
                            endIcon={<OpenInNewIcon color="inherit" />}
                          />
                        ),
                      }}
                    />
                  </Typography>
                </ul>
              </div>
              <Text>{t('descriptionPaid.cannotRestore')}</Text>
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
