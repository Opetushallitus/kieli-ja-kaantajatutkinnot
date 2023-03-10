import { useCallback, useEffect } from 'react';
import { CustomButton, H2, Text } from 'shared/components';
import { Duration, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import {
  PublicEmailRegistration,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';
import { resetPublicRegistration } from 'redux/reducers/examSession';

export const Done = ({
  registration,
}: {
  registration: PublicEmailRegistration | PublicSuomiFiRegistration;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.done',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const resetAndRedirect = useCallback(() => {
    dispatch(resetPublicRegistration());
  }, [dispatch]);

  useEffect(() => {
    showToast({
      severity: Severity.Success,
      description: t('successToast'),
    });

    const timer = setTimeout(() => {
      resetAndRedirect();
    }, Duration.MediumExtra);

    return () => clearTimeout(timer);
  }, [t, showToast, resetAndRedirect]);

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        <strong>{`${t('description.part1')}: ${registration.email}`}</strong>
      </Text>
      <Text>{t('description.part2')}</Text>
      <CustomButton
        className="align-self-start margin-top-lg"
        color="secondary"
        variant="contained"
        onClick={resetAndRedirect}
      >
        {translateCommon('frontPage')}
      </CustomButton>
    </div>
  );
};
