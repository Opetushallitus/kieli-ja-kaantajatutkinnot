import dayjs, { Dayjs } from 'dayjs';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomButton,
  CustomSwitch,
  CustomTextField,
  LanguageSelect,
  languageToComboBoxOption,
  LoadingProgressIndicator,
  Text,
  valueAsOption,
} from 'shared/components';
import { Color, TextFieldVariant, Variant } from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';
import { CommonUtils, DateUtils } from 'shared/utils';

import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { AuthorisationBasisEnum } from 'enums/clerkTranslator';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { Authorisation, AuthorisationBasis } from 'interfaces/authorisation';
import { ExaminationDate } from 'interfaces/examinationDate';
import { MeetingDate } from 'interfaces/meetingDate';
import { AuthorisationUtils } from 'utils/authorisation';

interface AuthorisationFieldsProps {
  authorisation: Authorisation;
  setAuthorisation: (
    a: ((prevState: Authorisation) => Authorisation) | Authorisation
  ) => void;
  meetingDates: Array<MeetingDate>;
  examinationDates: Array<ExaminationDate>;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const dateToOption = (date: Dayjs): ComboBoxOption => {
  return {
    value: date.toISOString(),
    label: DateUtils.formatOptionalDate(date),
  };
};

export const AuthorisationFields = ({
  authorisation,
  setAuthorisation,
  meetingDates,
  examinationDates,
  onSave,
  onCancel,
  isLoading,
}: AuthorisationFieldsProps) => {
  const availableMeetingDateValues = meetingDates
    .map((m) => m.date)
    .map(dateToOption);
  const availableExaminationDates = examinationDates
    .map((m) => m.date)
    .map(dateToOption);

  const [isAuthorisationDataChanged, setIsAuthorisationDataChanged] =
    useState(false);

  const translateCommon = useCommonTranslation();
  const translateLanguage = useKoodistoLanguagesTranslation();
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.newAuthorisation',
  });

  useEffect(() => {
    setAuthorisation((prevState) => ({
      ...prevState,
      tempId: CommonUtils.createUniqueId(),
    }));
  }, [setAuthorisation]);

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
    const basis = value?.value as AuthorisationBasis;
    const examinationDate =
      basis === AuthorisationBasisEnum.AUT
        ? authorisation.examinationDate
        : undefined;
    const termEndDate = getNewTermEndDate(basis, authorisation.termBeginDate);

    setAuthorisation({
      ...authorisation,
      basis,
      examinationDate,
      termEndDate,
    });
    setIsAuthorisationDataChanged(true);
  };

  const handleTermBeginDateChange = ({}, value: AutocompleteValue) => {
    const termBeginDate = value?.value ? dayjs(value?.value) : undefined;
    const termEndDate = getNewTermEndDate(authorisation.basis, termBeginDate);

    setAuthorisation({
      ...authorisation,
      termBeginDate,
      termEndDate,
    });
    setIsAuthorisationDataChanged(true);
  };

  const getNewTermEndDate = (
    basis: AuthorisationBasis,
    termBeginDate: Dayjs | undefined
  ) => {
    const PERIOD_OF_VALIDITY = 5;

    return basis !== AuthorisationBasisEnum.VIR
      ? termBeginDate?.add(PERIOD_OF_VALIDITY, 'year')
      : undefined;
  };

  const handleExaminationDateChange = ({}, value: AutocompleteValue) => {
    setAuthorisation({
      ...authorisation,
      examinationDate: value?.value ? dayjs(value?.value) : undefined,
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

  const isSaveButtonDisabled = () => {
    const {
      languagePair: { from: fromLang, to: toLang },
      basis,
      examinationDate,
      termBeginDate,
    } = authorisation;

    const isExaminationDateNotDefinedOrInvalid =
      basis === AuthorisationBasisEnum.AUT &&
      (!examinationDate || !dayjs(examinationDate).isValid());

    const isRequiredPropsEmpty = Object.values({
      fromLang,
      toLang,
      basis,
      termBeginDate,
    }).some((p) => !p);

    return (
      isLoading || isExaminationDateNotDefinedOrInvalid || isRequiredPropsEmpty
    );
  };

  const selectedTermBeginDate = authorisation.termBeginDate
    ? dateToOption(authorisation.termBeginDate)
    : null;

  const selectedExaminationDate = authorisation.examinationDate
    ? dateToOption(authorisation.examinationDate)
    : null;

  const testIdPrefix = 'authorisation-field';
  const isExistingAuthorisation = !!authorisation.id;

  useNavigationProtection(isAuthorisationDataChanged);

  return (
    <>
      <div className="rows gapped">
        <div className="authorisation__fields gapped align-items-start full-max-width">
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.from')}</Text>
            <LanguageSelect
              data-testid={`${testIdPrefix}-from`}
              autoHighlight
              label={t('fieldPlaceholders.from')}
              variant={TextFieldVariant.Outlined}
              value={getLanguageSelectValue(authorisation.languagePair.from)}
              onChange={handleLanguageSelectChange('from')}
              languages={AuthorisationUtils.selectableLanguagesForLanguageFilter(
                AuthorisationUtils.getKoodistoLangKeys(),
                authorisation.languagePair.to
              )}
              primaryLanguages={AuthorisationUtils.primaryLangs}
              excludedLanguage={authorisation.languagePair.to}
              translateLanguage={translateLanguage}
              disabled={isLoading || isExistingAuthorisation}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.to')}</Text>
            <LanguageSelect
              data-testid={`${testIdPrefix}-to`}
              autoHighlight
              label={t('fieldPlaceholders.to')}
              variant={TextFieldVariant.Outlined}
              value={getLanguageSelectValue(authorisation.languagePair.to)}
              onChange={handleLanguageSelectChange('to')}
              languages={AuthorisationUtils.selectableLanguagesForLanguageFilter(
                AuthorisationUtils.getKoodistoLangKeys(),
                authorisation.languagePair.from
              )}
              primaryLanguages={AuthorisationUtils.primaryLangs}
              excludedLanguage={authorisation.languagePair.from}
              translateLanguage={translateLanguage}
              disabled={isLoading || isExistingAuthorisation}
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
              disabled={isLoading || isExistingAuthorisation}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.examinationDate')}</Text>
            <ComboBox
              data-testid={`${testIdPrefix}-examinationDate`}
              label={t('fieldPlaceholders.examinationDate')}
              value={selectedExaminationDate}
              values={availableExaminationDates}
              variant={TextFieldVariant.Outlined}
              onChange={handleExaminationDateChange}
              disabled={
                isLoading ||
                isExistingAuthorisation ||
                authorisation.basis !== AuthorisationBasisEnum.AUT
              }
            />
          </div>
        </div>
        <div className="authorisation__fields gapped align-items-start">
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.termBeginDate')}</Text>
            <ComboBox
              data-testid={`${testIdPrefix}-termBeginDate`}
              autoHighlight
              label={t('fieldPlaceholders.termBeginDate')}
              values={availableMeetingDateValues}
              value={selectedTermBeginDate}
              variant={TextFieldVariant.Outlined}
              onChange={handleTermBeginDateChange}
              disabled={isLoading || isExistingAuthorisation}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.termEndDate')}</Text>
            <CustomTextField
              data-testid={`${testIdPrefix}-termEndDate`}
              label={t('fieldPlaceholders.termEndDate')}
              value={DateUtils.formatOptionalDate(authorisation?.termEndDate)}
              disabled
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.diaryNumber')}</Text>
            <CustomTextField
              data-testid={`${testIdPrefix}-diaryNumber`}
              label={t('fieldPlaceholders.diaryNumber')}
              value={authorisation.diaryNumber}
              onChange={handleDiaryNumberChange}
              disabled={isLoading}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('switch.permissionToPublish')}</Text>
            <CustomSwitch
              dataTestId={`${testIdPrefix}-permissionToPublish`}
              value={authorisation.permissionToPublish}
              leftLabel={translateCommon('no')}
              rightLabel={translateCommon('yes')}
              onChange={handleSwitchValueChange}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <div className="columns gapped margin-top-lg flex-end">
        <CustomButton
          disabled={isLoading}
          data-testid="authorisation-modal__cancel"
          className="margin-right-xs"
          onClick={onCancel}
          variant={Variant.Text}
          color={Color.Secondary}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            data-testid="authorisation-modal__save"
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={onSave}
            disabled={isSaveButtonDisabled()}
          >
            {translateCommon('save')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    </>
  );
};
