import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';

import { CustomButton } from 'components/elements/CustomButton';
import { DatePicker } from 'components/elements/DatePicker';
import { LoadingProgressIndicator } from 'components/elements/LoadingProgressIndicator';
import { H3 } from 'components/elements/Text';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIResponseStatus } from 'enums/api';
import { Color, Variant } from 'enums/app';
import { useNavigationProtection } from 'hooks/navigation/useNavigationProtection';
import { addExaminationDate } from 'redux/actions/examinationDate';
import { examinationDatesSelector } from 'redux/selectors/examinationDate';
import { DateUtils } from 'utils/date';
import { StringUtils } from 'utils/string';

export const AddExaminationDate = () => {
  const dayjs = DateUtils.dayjs();
  const [value, setValue] = useState<string>('');
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.addExaminationDate',
  });

  const {
    examinationDates: { dates, status },
  } = useAppSelector(examinationDatesSelector);
  const isLoading = status === APIResponseStatus.InProgress;

  const dispatch = useAppDispatch();

  const handleAddDate = () => {
    value && dispatch(addExaminationDate(dayjs(value)));
  };

  const isAddButtonDisabled = () => {
    if (value) {
      const date = dayjs(value);

      return dates.some((examinationDate) =>
        DateUtils.isDatePartEqual(examinationDate.date, date)
      );
    }

    return true;
  };

  useNavigationProtection(!StringUtils.isBlankString(value));

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
          </LoadingProgressIndicator>
        </div>
      </div>
    </div>
  );
};
