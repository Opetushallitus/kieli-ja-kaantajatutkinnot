import { useEffect } from 'react';
import { CustomButton, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import {
  ChosenTranslatorsHeading,
  StepHeading,
} from 'components/contactRequest/ContactRequestFormUtils';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { deselectPublicTranslator } from 'redux/reducers/publicTranslator';
import { selectedPublicTranslatorsForLanguagePair } from 'redux/selectors/publicTranslator';

const TranslatorRow = ({
  id,
  firstName,
  lastName,
}: {
  id: number;
  firstName: string;
  lastName: string;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm.verifySelectedTranslatorsStep',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();

  const deselectTranslator = () => dispatch(deselectPublicTranslator(id));

  const deselectButtonAriaLabel =
    t('accessibility.deselectTranslator') + ': ' + firstName + ' ' + lastName;

  return (
    <div className="columns gapped">
      <Text>
        {firstName} {lastName}
      </Text>
      <CustomButton
        data-testid={`contact-request-page__deselect-translator-id-${id}-btn`}
        variant={Variant.Outlined}
        onClick={deselectTranslator}
        color={Color.Secondary}
        aria-label={deselectButtonAriaLabel}
      >
        {translateCommon('delete')}
      </CustomButton>
    </div>
  );
};

export const VerifySelectedTranslators = ({
  disableNext,
}: {
  disableNext: (disabled: boolean) => void;
}) => {
  const translators = useAppSelector(selectedPublicTranslatorsForLanguagePair);

  useEffect(
    () => disableNext(translators.length == 0),
    [disableNext, translators]
  );

  return (
    <div className="rows">
      <StepHeading step={ContactRequestFormStep.VerifyTranslators} />
      <div className="rows gapped">
        <ChosenTranslatorsHeading />
        <div className="rows gapped-xs">
          {translators.map(({ id, firstName, lastName }) => (
            <TranslatorRow
              key={id}
              id={id}
              firstName={firstName}
              lastName={lastName}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
