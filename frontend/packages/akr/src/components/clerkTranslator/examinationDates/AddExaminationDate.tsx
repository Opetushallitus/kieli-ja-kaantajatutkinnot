import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import {
  CustomButton,
  CustomDatePicker,
  H3,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { addExaminationDate } from 'redux/reducers/examinationDate';
import { examinationDatesSelector } from 'redux/selectors/examinationDate';

export const AddExaminationDate = () => {
  const [value, setValue] = useState<Dayjs | null>(null);
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.addExaminationDate',
  });
  const {
    examinationDates: { dates, status },
  } = useAppSelector(examinationDatesSelector);
  const isLoading = status === APIResponseStatus.InProgress;

  const dispatch = useAppDispatch();

  const handleAddDate = () => {
    if (value) {
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

  useNavigationProtection(!!value);

  return (
    <div className="columns gapped">
      <div className="rows gapped flex-grow-3">
        <H3>{t('header')}</H3>
        <div className="columns gapped">
          <CustomDatePicker
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
