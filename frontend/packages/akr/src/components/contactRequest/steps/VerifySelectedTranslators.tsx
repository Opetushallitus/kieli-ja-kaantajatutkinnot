import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton } from '@mui/material';
import { useEffect } from 'react';
import { Text } from 'shared/components';
import { Color } from 'shared/enums';

import {
  ChosenTranslatorsHeading,
  StepHeading,
} from 'components/contactRequest/ContactRequestFormUtils';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { removeSelectedPublicTranslator } from 'redux/reducers/publicTranslator';
import { selectedPublicTranslatorsForLanguagePair } from 'redux/selectors/publicTranslator';

export const VerifySelectedTranslators = ({
  disableNext,
}: {
  disableNext: (disabled: boolean) => void;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm.verifySelectedTranslatorsStep',
  });
  const translators = useAppSelector(selectedPublicTranslatorsForLanguagePair);
  const dispatch = useAppDispatch();

  const deselectTranslator = (id: number) =>
    dispatch(removeSelectedPublicTranslator(id));

  useEffect(
    () => disableNext(translators.length == 0),
    [disableNext, translators]
  );

  return (
    <div className="rows">
      <StepHeading step={ContactRequestFormStep.VerifyTranslators} />
      <div className="rows gapped">
        <ChosenTranslatorsHeading />
        {translators.map(({ id, firstName, lastName }) => {
          const ariaLabel =
            t('accessibility.deselectTranslator') +
            ': ' +
            firstName +
            ' ' +
            lastName;

          return (
            <div
              className="columns"
              key={id}
              data-testid={`contact-request-page__chosen-translator-id-${id}`}
            >
              <Text>
                {firstName} {lastName}
              </Text>
              <IconButton
                aria-label={ariaLabel}
                onClick={() => deselectTranslator(id)}
              >
                <DeleteOutlineIcon color={Color.Error} />
              </IconButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};
