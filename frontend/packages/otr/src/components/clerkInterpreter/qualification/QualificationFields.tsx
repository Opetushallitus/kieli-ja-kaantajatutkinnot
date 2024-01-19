import dayjs, { Dayjs } from 'dayjs';
import { ChangeEvent, useEffect, useState } from 'react';
import {
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
import { ExaminationType } from 'enums/interpreter';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { MeetingDate } from 'interfaces/meetingDate';
import { NewQualification } from 'interfaces/qualification';
import { QualificationUtils } from 'utils/qualifications';

interface QualificationFieldsProps {
  qualification: NewQualification;
  setQualification: (
    q: ((prevState: NewQualification) => NewQualification) | NewQualification,
  ) => void;
  meetingDates: Array<MeetingDate>;
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

export const QualificationFields = ({
  qualification,
  setQualification,
  meetingDates,
  onSave,
  onCancel,
  isLoading,
}: QualificationFieldsProps) => {
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
  }, [setQualification]);

  const availableMeetingDateValues = meetingDates
    .map((m) => m.date)
    .map(dateToOption);

  const selectedBeginDate = qualification.beginDate
    ? dateToOption(qualification.beginDate)
    : null;

  const handleLanguageSelectChange =
    (fieldName: 'fromLang' | 'toLang') => (language?: string) => {
      setQualification({
        ...qualification,
        [fieldName]: language,
      });
      setIsQualificationDataChanged(true);
    };

  const handleExaminationTypeChange = (value?: string) => {
    const examinationType = value as ExaminationType;

    setQualification({
      ...qualification,
      examinationType,
    });
    setIsQualificationDataChanged(true);
  };

  const handleBeginDateChange = (value?: string) => {
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
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setQualification({
      ...qualification,
      diaryNumber: event?.target.value,
    });
    setIsQualificationDataChanged(true);
  };

  const getLanguageSelectValue = (language?: string) =>
    language ? languageToComboBoxOption(translateLanguage, language) : null;

  const isSaveButtonDisabled = () => {
    const { fromLang, toLang, beginDate, examinationType } = qualification;

    const isRequiredPropsEmpty = [
      fromLang,
      toLang,
      beginDate,
      examinationType,
    ].some((p) => !p);

    return isLoading || isRequiredPropsEmpty;
  };

  const testIdPrefix = 'qualification-field';
  const isExistingQualification = !!qualification.id;

  useNavigationProtection(isQualificationDataChanged);

  return (
    <>
      <div className="rows gapped">
        <div className="qualification__fields gapped align-items-start full-max-width">
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.from')}</Text>
            <LanguageSelect
              data-testid={`${testIdPrefix}-from`}
              autoHighlight
              label={t('fieldPlaceholders.from')}
              variant={TextFieldVariant.Outlined}
              value={getLanguageSelectValue(qualification.fromLang)}
              onLanguageChange={handleLanguageSelectChange('fromLang')}
              languages={QualificationUtils.selectableFromLangs}
              excludedLanguage={qualification.toLang}
              translateLanguage={translateLanguage}
              disabled
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.to')}</Text>
            <LanguageSelect
              data-testid={`${testIdPrefix}-to`}
              autoHighlight
              label={t('fieldPlaceholders.to')}
              variant={TextFieldVariant.Outlined}
              value={getLanguageSelectValue(qualification.toLang)}
              onLanguageChange={handleLanguageSelectChange('toLang')}
              languages={QualificationUtils.getKoodistoLangKeys()}
              excludedLanguage={qualification.fromLang}
              translateLanguage={translateLanguage}
              disabled={isLoading || isExistingQualification}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.examination')}</Text>
            <ComboBox
              data-testid={`${testIdPrefix}-examination`}
              autoHighlight
              label={t('fieldPlaceholders.examination')}
              values={Object.values(ExaminationType).map(valueAsOption)}
              value={
                qualification.examinationType
                  ? valueAsOption(qualification.examinationType)
                  : null
              }
              variant={TextFieldVariant.Outlined}
              onChange={handleExaminationTypeChange}
              disabled={isLoading || isExistingQualification}
            />
          </div>
        </div>
        <div className="qualification__fields gapped align-items-start">
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.beginDate')}</Text>
            <ComboBox
              data-testid={`${testIdPrefix}-beginDate`}
              autoHighlight
              label={t('fieldPlaceholders.beginDate')}
              values={availableMeetingDateValues}
              value={selectedBeginDate}
              variant={TextFieldVariant.Outlined}
              onChange={handleBeginDateChange}
              disabled={isLoading || isExistingQualification}
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.endDate')}</Text>
            <CustomTextField
              data-testid={`${testIdPrefix}-endDate`}
              label={t('fieldPlaceholders.endDate')}
              value={DateUtils.formatOptionalDate(qualification?.endDate)}
              disabled
            />
          </div>
          <div className="rows gapped-xs">
            <Text className="bold">{t('fieldLabel.diaryNumber')}</Text>
            <CustomTextField
              data-testid={`${testIdPrefix}-diaryNumber`}
              label={t('fieldPlaceholders.diaryNumber')}
              value={qualification.diaryNumber}
              onChange={handleDiaryNumberChange}
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <div className="columns gapped margin-top-lg flex-end">
        <CustomButton
          disabled={isLoading}
          data-testid="qualification-modal__cancel"
          className="margin-right-xs"
          onClick={onCancel}
          variant={Variant.Text}
          color={Color.Secondary}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            data-testid="qualification-modal__save"
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
