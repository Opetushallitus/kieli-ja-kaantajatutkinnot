import { useEffect } from 'react';
import { Button } from '@mui/material';

import { H2, Text } from 'components/elements/Text';
import {
  StepHeading,
  stepsByIndex,
} from 'components/contactRequest/ContactRequestFormUtils';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { resetContactRequestAndRedirect } from 'redux/actions/contactRequest';
import { Duration } from 'enums/app';

export const Done = () => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm.doneStep',
  });

  // Redux
  const dispatch = useAppDispatch();

  const resetAndRedirect = () => {
    dispatch(resetContactRequestAndRedirect);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      resetAndRedirect();
    }, Duration.MediumExtra);

    return () => clearTimeout(timer);
  });

  return (
    <div className="rows">
      <StepHeading step={stepsByIndex[4]} />
      <div className="rows gapped">
        <div className="rows gapped">
          <H2>{t('title')}</H2>
          <Text>{t('description')}</Text>
          <Button
            className="align-self-start m-margin-top"
            color="secondary"
            variant="contained"
            onClick={resetAndRedirect}
            data-testid="contact-request-page__homepage-btn"
          >
            {t('button')}
          </Button>
        </div>
      </div>
    </div>
  );
};
