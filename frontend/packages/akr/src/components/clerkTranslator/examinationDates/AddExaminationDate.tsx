import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  CustomButton,
  DatePicker,
  H3,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils, StringUtils } from 'shared/utils';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { addExaminationDate } from 'redux/reducers/examinationDate';
import { examinationDatesSelector } from 'redux/selectors/examinationDate';
import { NotifierUtils } from 'utils/notifier';

export const AddExaminationDate = () => {
  const [value, setValue] = useState<string>('');
  const [showToastOnError, setShowToastOnError] = useState(false);
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.addExaminationDate',
  });
  const { showToast } = useToast();

  const {
    examinationDates: { dates, status },
    addExaminationDate: { error: addExaminationDateError },
  } = useAppSelector(examinationDatesSelector);
  const isLoading = status === APIResponseStatus.InProgress;

  const dispatch = useAppDispatch();

  const handleAddDate = () => {
    if (value) {
      setShowToastOnError(true);
      dispatch(addExaminationDate(dayjs(value)));
    }
  };

  const isSelectedDateAlreadyTaken = () => {
    if (value) {
      const date = dayjs(value);

      return dates.some((examinationDate) =>
        DateUtils.isDatePartEqual(examinationDate.date, date)
      );
    }

    return false;
  };

  const isAddButtonDisabled = () => {
    return !value || isSelectedDateAlreadyTaken();
  };

  const renderDateAlreadyTakenInfo = () =>
    isSelectedDateAlreadyTaken() ? (
      <>
        <ErrorOutlineIcon />
        <Text>{t('examinationDateAlreadyExists')}</Text>
      </>
    ) : null;

  useNavigationProtection(!StringUtils.isBlankString(value));
  useEffect(() => {
    if (addExaminationDateError && showToastOnError) {
      setShowToastOnError(false);
      showToast({
        severity: Severity.Error,
        description: NotifierUtils.getAPIErrorMessage(addExaminationDateError),
      });
    }
  }, [addExaminationDateError, showToast, showToastOnError]);

  return (
    <div className="columns gapped">
      <div className="rows gapped flex-grow-3">
        <H3>{t('header')}</H3>
        <div className="columns gapped">
          <DatePicker
            value={value}
            setValue={setValue}
            label={t('datePicker.label')}
          />
          <LoadingProgressIndicator isLoading={isLoading}>
            <div className="columns gapped-xs">
              <CustomButton
                data-testid="examination-dates-page__add-btn"
                variant={Variant.Outlined}
                color={Color.Secondary}
                startIcon={<AddIcon />}
                disabled={isAddButtonDisabled() || isLoading}
                onClick={handleAddDate}
              >
                {t('buttons.add')}
              </CustomButton>
              {renderDateAlreadyTakenInfo()}
            </div>
          </LoadingProgressIndicator>
        </div>
      </div>
    </div>
  );
};
