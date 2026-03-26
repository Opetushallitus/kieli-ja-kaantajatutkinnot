import { useCallback, useState } from 'react';
import {
  CustomButton,
  CustomButtonLink,
  LoadingProgressIndicator,
  StackableMobileAppBar,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useWindowProperties } from 'shared/hooks';
import { MobileAppBarState } from 'shared/interfaces';

import { MemoizedPublicRegistrationTimer } from 'components/registration/PublicRegistrationTimer';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  PublicRegistrationFormStep,
  PublicRegistrationFormSubmitError,
} from 'enums/publicRegistration';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import {
  cancelRegistration,
  increaseActiveStep,
  setShowErrors,
  submitPublicRegistration,
} from 'redux/reducers/registration';
import { publicIdentificationSelector } from 'redux/selectors/publicIdentifaction';
import { registrationSelector } from 'redux/selectors/registration';

const AbortButton = () => {
  const dispatch = useAppDispatch();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.controlButtons',
  });
  const { activeStep } = useAppSelector(registrationSelector);
  const onAbort = () => {
    if (activeStep === PublicRegistrationFormStep.Identify) {
      // If user is on registration form, aborting registration will be handled by navigation protection.
      // If user is however on the identification step, we must abort the reservation ourselves.
      dispatch(cancelRegistration());
    }
  };

  return (
    <>
      <CustomButtonLink
        variant={Variant.Text}
        color={Color.Secondary}
        to={AppRoutes.Registration}
        onClick={onAbort}
        data-testid="public-registration__controlButtons__abort"
      >
        {t('abortRegistration')}
      </CustomButtonLink>
    </>
  );
};

const SubmitButton = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });
  const translateCommon = useCommonTranslation();
  const {
    activeStep,
    submitRegistration: { status: submitRegistrationStatus },
  } = useAppSelector(registrationSelector);
  const { showDialog } = useDialog();
  const dispatch = useAppDispatch();
  const getRegistrationErrors = usePublicRegistrationErrors(true);
  const { isPhone } = useWindowProperties();

  const isSubmitInProgress =
    submitRegistrationStatus === APIResponseStatus.InProgress;
  const handleSubmitBtnClick = () => {
    if (activeStep === PublicRegistrationFormStep.Register) {
      dispatch(setShowErrors(true));
      const registrationErrors = getRegistrationErrors();
      if (Object.values(registrationErrors).some((v) => v)) {
        const dialogContent = (
          <div>
            <Text>{t('registrationDetails.errors.fixErrors')}</Text>
            <ul>
              {Object.entries(registrationErrors)
                .filter(([_, val]) => val)
                .map(([field, _]) => (
                  <li key={field}>
                    <Text>
                      {t(`registrationDetails.errors.fields.${field}`)}
                    </Text>
                  </li>
                ))}
            </ul>
          </div>
        );
        showDialog({
          title: t('registrationDetails.errors.title'),
          severity: Severity.Error,
          content: dialogContent,
          actions: [
            { title: translateCommon('back'), variant: Variant.Contained },
          ],
        });
      } else {
        dispatch(submitPublicRegistration());
      }
    } else {
      dispatch(increaseActiveStep());
    }
  };

  return (
    <LoadingProgressIndicator
      translateCommon={translateCommon}
      isLoading={isSubmitInProgress}
    >
      <CustomButton
        className="margin-top-lg"
        disabled={isSubmitInProgress}
        size="large"
        sx={!isPhone ? { width: '30rem', padding: '15px 22px' } : {}}
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={handleSubmitBtnClick}
        data-testid="public-registration__controlButtons__submit"
      >
        <Text color="white">{t('controlButtons.confirm')}</Text>
      </CustomButton>
    </LoadingProgressIndicator>
  );
};

export const PublicRegistrationControlButtons = () => {
  const [appBarState, setAppBarState] = useState<MobileAppBarState>({});
  const emailLinkOrderStatus = useAppSelector(publicIdentificationSelector)
    .emailLinkOrder.status;
  const {
    activeStep,
    initRegistration: { expiresIn },
    submitRegistration: {
      status: submitRegistrationStatus,
      error: submitRegistrationError,
    },
  } = useAppSelector(registrationSelector);
  const { isPhone } = useWindowProperties();

  const unrecoverableError =
    submitRegistrationError &&
    [
      PublicRegistrationFormSubmitError.AlreadyRegistered,
      PublicRegistrationFormSubmitError.FormExpired,
      PublicRegistrationFormSubmitError.RegistrationPeriodClosed,
    ].includes(submitRegistrationError);

  const renderAbort =
    (activeStep === PublicRegistrationFormStep.Identify &&
      emailLinkOrderStatus !== APIResponseStatus.Success) ||
    (activeStep === PublicRegistrationFormStep.Register &&
      submitRegistrationStatus !== APIResponseStatus.Success);
  const renderSubmit =
    activeStep === PublicRegistrationFormStep.Register &&
    submitRegistrationStatus !== APIResponseStatus.Success &&
    !unrecoverableError;

  const memoizedSetAppBarState = useCallback(
    (order: number, height: number) =>
      setAppBarState((prev) => ({
        ...prev,
        [order]: height,
      })),
    [],
  );

  if (renderAbort || renderSubmit) {
    return isPhone ? (
      <>
        <StackableMobileAppBar
          order={1}
          state={appBarState}
          setState={memoizedSetAppBarState}
        >
          <div className="rows" style={{ width: '100%' }}>
            {expiresIn &&
              activeStep === PublicRegistrationFormStep.Register && (
                <MemoizedPublicRegistrationTimer expiresIn={expiresIn} />
              )}
          </div>
        </StackableMobileAppBar>
        <StackableMobileAppBar
          order={2}
          state={appBarState}
          setState={memoizedSetAppBarState}
        >
          <div className="rows" style={{ width: '100%' }}>
            <div className="columns margin-top-lg space-between">
              {renderAbort && <AbortButton />}
              {renderSubmit && <SubmitButton />}
            </div>
          </div>
        </StackableMobileAppBar>
      </>
    ) : (
      <div className="columns margin-top-lg justify-content-center">
        <div className="rows flex-end gapped margin-top-lg align-items-center">
          {renderSubmit && <SubmitButton />}
          {renderAbort && <AbortButton />}
        </div>
      </div>
    );
  } else {
    return null;
  }
};
