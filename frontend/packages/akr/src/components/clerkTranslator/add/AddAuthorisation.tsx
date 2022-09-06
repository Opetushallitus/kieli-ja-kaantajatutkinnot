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
import { CommonUtils, DateUtils, StringUtils } from 'shared/utils';

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

interface AddAuthorisationProps {
  translatorId?: number;
  meetingDates: Array<MeetingDate>;
  examinationDates: Array<ExaminationDate>;
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

const dateToOption = (date: Dayjs): ComboBoxOption => {
  return {
    value: date.toISOString(),
    label: DateUtils.formatOptionalDate(date),
  };
};

export const AddAuthorisation = ({
  translatorId,
  meetingDates,
  examinationDates,
  isLoading,
  onAuthorisationAdd,
  onCancel,
}: AddAuthorisationProps) => {
  const availableMeetingDateValues = meetingDates
    .map((m) => m.date)
    .map(dateToOption);
  const availableExaminationDates = examinationDates
    .map((m) => m.date)
    .map(dateToOption);

  const [authorisation, setAuthorisation] =
    useState<Authorisation>(newAuthorisation);
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
    const basis = value?.value as AuthorisationBasis;

    setAuthorisation({
      ...authorisation,
      basis,
      examinationDate:
        basis === AuthorisationBasisEnum.AUT ? undefined : undefined,
    });
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

  const isAddButtonDisabled = () => {
    const {
      languagePair: { from: fromLang, to: toLang },
      examinationDate,
      diaryNumber,
      permissionToPublish: _unused,
      ...otherProps
    } = authorisation;

    const isExaminationDateNotDefinedOrInvalid =
      otherProps.basis === AuthorisationBasisEnum.AUT &&
      (!examinationDate || !dayjs(examinationDate).isValid());

    const isDiaryNumberInvalid = StringUtils.isBlankString(diaryNumber);

    // If permissionToPublish wasn't marked `_unused`, this would consider false value there being incorrect
    const isOtherPropsNotDefined = Object.values({
      fromLang,
      toLang,
      ...otherProps,
    }).some((p) => !p);

    return (
      isLoading ||
      isExaminationDateNotDefinedOrInvalid ||
      isDiaryNumberInvalid ||
      isOtherPropsNotDefined
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

  const selectedTermBeginDate = authorisation.termBeginDate
    ? dateToOption(authorisation.termBeginDate)
    : null;

  const selectedExaminationDate = authorisation.examinationDate
    ? dateToOption(authorisation.examinationDate)
    : null;

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
            <ComboBox
              data-testid={`${testIdPrefix}-examinationDate`}
              label={t('fieldPlaceholders.examinationDate')}
              value={selectedExaminationDate}
              values={availableExaminationDates}
              variant={TextFieldVariant.Outlined}
              onChange={handleExaminationDateChange}
              disabled={authorisation.basis !== AuthorisationBasisEnum.AUT}
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
              value={selectedTermBeginDate}
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
            <Text className="bold">{t('switch.permissionToPublish')}</Text>
            <CustomSwitch
              dataTestId={`${testIdPrefix}-permissionToPublish`}
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
