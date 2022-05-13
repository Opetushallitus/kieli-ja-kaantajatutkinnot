import dayjs from 'dayjs';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomButton,
  CustomSwitch,
  CustomTextField,
  DatePicker,
  LanguageSelect,
  languageToComboBoxOption,
  LoadingProgressIndicator,
  Text,
  valueAsOption,
} from 'shared/components';
import { Color, TextFieldVariant, Variant } from 'shared/enums';
import { CommonUtils, DateUtils, StringUtils } from 'shared/utils';

import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { AuthorisationBasisEnum } from 'enums/clerkTranslator';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { Authorisation, AuthorisationBasis } from 'interfaces/authorisation';
import { MeetingDate } from 'interfaces/meetingDate';
import { AuthorisationUtils } from 'utils/authorisation';

interface AddAuthorisationProps {
  translatorId?: number;
  meetingDates: Array<MeetingDate>;
  isLoading?: boolean;
  onCancel: () => void;
  onAuthorisationAdd(authorisation: Authorisation): void;
}

const newAuthorisation: Authorisation = {
  languagePair: { from: '', to: '' },
  basis: null as unknown as AuthorisationBasis,
  termBeginDate: undefined,
  termEndDate: undefined,
  permissionToPublish: true,
  diaryNumber: '',
  examinationDate: undefined,
};

export const AddAuthorisation = ({
  translatorId,
  meetingDates,
  isLoading,
  onAuthorisationAdd,
  onCancel,
}: AddAuthorisationProps) => {
  const currentDate = dayjs();
  const availableMeetingDateValues = meetingDates
    .filter((m) => m.date.isBefore(currentDate, 'day'))
    .map((m) => {
      return {
        value: m.date.toISOString(),
        label: DateUtils.formatOptionalDate(dayjs(m.date)),
      };
    });

  const [authorisation, setAuthorisation] =
    useState<Authorisation>(newAuthorisation);
  const [examinationDate, setExaminationDate] = useState('');
  const [isAuthorisationDataChanged, setIsAuthorisationDataChanged] =
    useState(false);

  const translateCommon = useCommonTranslation();
  const translateLanguage = useKoodistoLanguagesTranslation();
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.newAuthorisation',
  });

  useEffect(() => {
    setAuthorisation((prevState) => ({
      ...prevState,
      tempId: CommonUtils.createUniqueId(),
    }));
  }, []);

  const handleLanguageSelectChange =
    (fieldName: string) =>
    ({}, value: AutocompleteValue) => {
      setAuthorisation({
        ...authorisation,
        languagePair: {
          ...authorisation.languagePair,
          [fieldName]: value?.value,
        },
      });
      setIsAuthorisationDataChanged(true);
    };

  const handleBasisChange = ({}, value: AutocompleteValue) => {
    setAuthorisation({
      ...authorisation,
      basis: value?.value as AuthorisationBasis,
    });
    if (value?.value !== AuthorisationBasisEnum.AUT) {
      setExaminationDate('');
    }
    setIsAuthorisationDataChanged(true);
  };

  const handleTermBeginDateChange = ({}, value: AutocompleteValue) => {
    const PERIOD_OF_VALIDITY = 5;
    const termBeginDate = value?.value ? dayjs(value?.value) : undefined;
    const termEndDate = termBeginDate?.add(PERIOD_OF_VALIDITY, 'year');
    setAuthorisation({
      ...authorisation,
      termBeginDate,
      termEndDate,
    });
    setIsAuthorisationDataChanged(true);
  };

  const handleExaminationDateChange = (value: string) => {
    setExaminationDate(value);
    setAuthorisation({
      ...authorisation,
      examinationDate: dayjs(value),
    });
    setIsAuthorisationDataChanged(true);
  };

  const handleSwitchValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAuthorisation({
      ...authorisation,
      permissionToPublish: event?.target.checked,
    });
    setIsAuthorisationDataChanged(true);
  };

  const handleDiaryNumberChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAuthorisation({
      ...authorisation,
      diaryNumber: event?.target.value,
    });
    setIsAuthorisationDataChanged(true);
  };

  const getLanguageSelectValue = (language?: string) =>
    language ? languageToComboBoxOption(translateLanguage, language) : null;

  const getTermBeginDate = () => {
    return authorisation.termBeginDate
      ? {
          value: authorisation.termBeginDate.toISOString(),
          label: DateUtils.formatOptionalDate(authorisation.termBeginDate),
        }
      : null;
  };

  const isAddButtonDisabled = () => {
    const { languagePair, diaryNumber, examinationDate, ...otherProps } =
      authorisation;

    const isOtherPropsNotDefined = Object.values(otherProps).some((p) =>
      StringUtils.isBlankString(p)
    );
    const isLangPropsNotDefined =
      StringUtils.isBlankString(languagePair.from) ||
      StringUtils.isBlankString(languagePair.to);

    const isDiaryNumberBlank = StringUtils.isBlankString(diaryNumber);

    const isExaminationDateNotDefinedOrInvalid =
      otherProps.basis === AuthorisationBasisEnum.AUT &&
      (!examinationDate || !dayjs(examinationDate).isValid());

    return (
      isLoading ||
      isOtherPropsNotDefined ||
      isLangPropsNotDefined ||
      isDiaryNumberBlank ||
      isExaminationDateNotDefinedOrInvalid
    );
  };

  const addAndResetAuthorisation = (authorisation: Authorisation) => {
    onAuthorisationAdd({
      ...authorisation,
      ...(translatorId && { translatorId }),
    });
    if (!translatorId) {
      setAuthorisation(newAuthorisation);
      onCancel();
    }
  };

  const testIdPrefix = 'add-authorisation-field';

  useNavigationProtection(isAuthorisationDataChanged);

  return (
    <>
      <div className="rows gapped">
        <div className="add-authorisation__fields gapped align-items-start full-max-width">
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.from')}</Text>
            <LanguageSelect
              data-testid={`${testIdPrefix}-from`}
              autoHighlight
              label={t('fieldPlaceholders.from')}
              variant={TextFieldVariant.Outlined}
              languages={AuthorisationUtils.getKoodistoLangKeys()}
              excludedLanguage={authorisation.languagePair.to || undefined}
              value={getLanguageSelectValue(authorisation.languagePair.from)}
              onChange={handleLanguageSelectChange('from')}
              translateLanguage={translateLanguage}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.to')}</Text>
            <LanguageSelect
              data-testid={`${testIdPrefix}-to`}
              autoHighlight
              label={t('fieldPlaceholders.to')}
              variant={TextFieldVariant.Outlined}
              languages={AuthorisationUtils.getKoodistoLangKeys()}
              excludedLanguage={authorisation.languagePair.from || undefined}
              value={getLanguageSelectValue(authorisation.languagePair.to)}
              onChange={handleLanguageSelectChange('to')}
              translateLanguage={translateLanguage}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.basis')}</Text>
            <ComboBox
              data-testid={`${testIdPrefix}-basis`}
              autoHighlight
              label={t('fieldPlaceholders.basis')}
              values={Object.values(AuthorisationBasisEnum).map(valueAsOption)}
              value={
                authorisation.basis ? valueAsOption(authorisation.basis) : null
              }
              variant={TextFieldVariant.Outlined}
              onChange={handleBasisChange}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.examinationDate')}</Text>
            <DatePicker
              label={t('fieldPlaceholders.examinationDate')}
              value={examinationDate}
              setValue={handleExaminationDateChange}
              disabled={authorisation.basis !== AuthorisationBasisEnum.AUT}
              dataTestId={`${testIdPrefix}-examinationDate`}
            />
          </div>
        </div>
        <div className="add-authorisation__fields gapped align-items-start">
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.termBeginDate')}</Text>
            <ComboBox
              data-testid={`${testIdPrefix}-termBeginDate`}
              autoHighlight
              label={t('fieldPlaceholders.termBeginDate')}
              values={availableMeetingDateValues}
              value={getTermBeginDate()}
              variant={TextFieldVariant.Outlined}
              onChange={handleTermBeginDateChange}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.termEndDate')}</Text>
            <CustomTextField
              data-testid={`${testIdPrefix}-termEndDate`}
              label={t('fieldPlaceholders.termEndDate')}
              value={DateUtils.formatOptionalDate(authorisation?.termEndDate)}
              disabled={true}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.diaryNumber')}</Text>
            <CustomTextField
              data-testid={`${testIdPrefix}-diaryNumber`}
              label={t('fieldPlaceholders.diaryNumber')}
              value={authorisation.diaryNumber}
              onChange={handleDiaryNumberChange}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('switch.canPublish')}</Text>
            <CustomSwitch
              dataTestId={`${testIdPrefix}-canPublish`}
              value={authorisation.permissionToPublish}
              leftLabel={translateCommon('no')}
              rightLabel={translateCommon('yes')}
              onChange={handleSwitchValueChange}
            />
          </div>
        </div>
      </div>
      <div className="columns gapped margin-top-lg flex-end">
        <CustomButton
          disabled={isLoading}
          data-testid="add-authorisation-modal__cancel"
          className="margin-right-xs"
          onClick={onCancel}
          variant={Variant.Text}
          color={Color.Secondary}
        >
          {translateCommon('cancel')}
        </CustomButton>
        {isLoading ? (
          <LoadingProgressIndicator isLoading={isLoading}>
            <CustomButton
              data-testid="add-authorisation-modal__save"
              variant={Variant.Contained}
              color={Color.Secondary}
              onClick={() => addAndResetAuthorisation(authorisation)}
              disabled={isAddButtonDisabled()}
            >
              {translateCommon('add')}
            </CustomButton>
          </LoadingProgressIndicator>
        ) : (
          <CustomButton
            data-testid="add-authorisation-modal__save"
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={() => addAndResetAuthorisation(authorisation)}
            disabled={isAddButtonDisabled()}
          >
            {translateCommon('add')}
          </CustomButton>
        )}
      </div>
    </>
  );
};
