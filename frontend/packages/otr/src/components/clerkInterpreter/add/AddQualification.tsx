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
import { ExaminationType } from 'enums/interpreter';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { Qualification } from 'interfaces/qualification';
import { QualificationUtils } from 'utils/qualifications';

interface AddQualificationProps {
  interpreterId?: number;
  isLoading?: boolean;
  onCancel: () => void;
  onQualificationAdd(qualification: Qualification): void;
}

const newQualification: Qualification = {
  fromLang: '',
  toLang: '',
  examinationType: undefined as unknown as ExaminationType,
  beginDate: undefined,
  endDate: undefined,
  permissionToPublish: true,
  diaryNumber: '',
};

export const AddQualification = ({
  interpreterId,
  isLoading,
  onQualificationAdd,
  onCancel,
}: AddQualificationProps) => {
  const [qualification, setQualification] =
    useState<Qualification>(newQualification);
  const [isQualificationDataChanged, setIsQualificationDataChanged] =
    useState(false);

  const translateCommon = useCommonTranslation();
  const translateLanguage = useKoodistoLanguagesTranslation();
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.newQualification',
  });

  useEffect(() => {
    setQualification((prevState) => ({
      ...prevState,
      tempId: CommonUtils.createUniqueId(),
    }));
  }, []);

  const handleLanguageSelectChange =
    (fieldName: string) =>
    ({}, value: AutocompleteValue) => {
      setQualification({
        ...qualification,
        [fieldName]: value?.value ?? '',
      });
      setIsQualificationDataChanged(true);
    };

  const handleExaminationTypeChange = ({}, value: AutocompleteValue) => {
    const examinationType = value?.value as ExaminationType;

    setQualification({
      ...qualification,
      examinationType,
    });
    setIsQualificationDataChanged(true);
  };

  const handleBeginDateChange = (value: string) => {
    const PERIOD_OF_VALIDITY = 5;
    const beginDate = value ? dayjs(value) : undefined;
    const endDate = beginDate?.add(PERIOD_OF_VALIDITY, 'year');
    setQualification({
      ...qualification,
      beginDate,
      endDate,
    });
    setIsQualificationDataChanged(true);
  };

  const handleSwitchValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQualification({
      ...qualification,
      permissionToPublish: event?.target.checked,
    });
    setIsQualificationDataChanged(true);
  };

  const handleDiaryNumberChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setQualification({
      ...qualification,
      diaryNumber: event?.target.value,
    });
    setIsQualificationDataChanged(true);
  };

  const getLanguageSelectValue = (language?: string) =>
    language ? languageToComboBoxOption(translateLanguage, language) : null;

  const isAddButtonDisabled = () => {
    const { beginDate, examinationType, ...otherProps } = qualification;

    const isOtherPropsNotDefined = Object.values(otherProps).some((p) =>
      StringUtils.isBlankString(p)
    );

    return (
      isLoading || isOtherPropsNotDefined || !beginDate || !examinationType
    );
  };

  const addAndResetQualification = (qualification: Qualification) => {
    onQualificationAdd({
      ...qualification,
      ...(interpreterId && { interpreterId }),
    });
    if (!interpreterId) {
      setQualification(newQualification);
      onCancel();
    }
  };

  const testIdPrefix = 'add-qualification-field';

  useNavigationProtection(isQualificationDataChanged);

  return (
    <>
      <div className="rows gapped">
        <div className="add-qualification__fields gapped align-items-start full-max-width">
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.from')}</Text>
            <LanguageSelect
              data-testid={`${testIdPrefix}-from`}
              autoHighlight
              label={t('fieldPlaceholders.from')}
              variant={TextFieldVariant.Outlined}
              languages={QualificationUtils.getKoodistoLangKeys()}
              excludedLanguage={qualification.toLang || undefined}
              value={getLanguageSelectValue(qualification.fromLang)}
              onChange={handleLanguageSelectChange('fromLang')}
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
              languages={QualificationUtils.getKoodistoLangKeys()}
              excludedLanguage={qualification.fromLang || undefined}
              value={getLanguageSelectValue(qualification.toLang)}
              onChange={handleLanguageSelectChange('toLang')}
              translateLanguage={translateLanguage}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.basis')}</Text>
            <ComboBox
              data-testid={`${testIdPrefix}-basis`}
              autoHighlight
              label={t('fieldPlaceholders.basis')}
              values={Object.values(ExaminationType).map(valueAsOption)}
              value={
                qualification.examinationType
                  ? valueAsOption(qualification.examinationType)
                  : null
              }
              variant={TextFieldVariant.Outlined}
              onChange={handleExaminationTypeChange}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.diaryNumber')}</Text>
            <CustomTextField
              data-testid={`${testIdPrefix}-diaryNumber`}
              label={t('fieldPlaceholders.diaryNumber')}
              value={qualification.diaryNumber}
              onChange={handleDiaryNumberChange}
            />
          </div>
        </div>
        <div className="add-qualification__fields gapped align-items-start">
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.beginDate')}</Text>
            <DatePicker
              value={
                qualification.beginDate
                  ? DateUtils.serializeDate(qualification.beginDate)
                  : ''
              }
              label=""
              setValue={handleBeginDateChange}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.endDate')}</Text>
            <DatePicker
              value={
                qualification.endDate
                  ? DateUtils.serializeDate(qualification.endDate)
                  : ''
              }
              label=""
              setValue={handleBeginDateChange}
              disabled={true}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('switch.permissionToPublish')}</Text>
            <CustomSwitch
              dataTestId={`${testIdPrefix}-permissionToPublish`}
              value={qualification.permissionToPublish}
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
          data-testid="add-qualification-modal__cancel"
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
              data-testid="add-qualification-modal__save"
              variant={Variant.Contained}
              color={Color.Secondary}
              onClick={() => addAndResetQualification(qualification)}
              disabled={isAddButtonDisabled()}
            >
              {translateCommon('add')}
            </CustomButton>
          </LoadingProgressIndicator>
        ) : (
          <CustomButton
            data-testid="add-qualification-modal__save"
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={() => addAndResetQualification(qualification)}
            disabled={isAddButtonDisabled()}
          >
            {translateCommon('add')}
          </CustomButton>
        )}
      </div>
    </>
  );
};
