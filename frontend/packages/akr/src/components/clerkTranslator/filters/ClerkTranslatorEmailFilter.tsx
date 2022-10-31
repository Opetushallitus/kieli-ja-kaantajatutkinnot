import { Checkbox } from '@mui/material';
import { Text } from 'shared/components';
import { Color } from 'shared/enums';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  addClerkTranslatorFilter,
  setPage,
} from 'redux/reducers/clerkTranslator';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';

export const ClerkTranslatorEmailFilter = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorFilters',
  });
  const { filters } = useAppSelector(clerkTranslatorsSelector);
  const dispatch = useAppDispatch();

  const handleCheckboxClick = () => {
    dispatch(
      addClerkTranslatorFilter({
        hasNoEmailAddress: !filters.hasNoEmailAddress,
      })
    );
    dispatch(setPage(0));
  };

  return (
    <div className="columns">
      <Checkbox
        data-testid="clerk-translator-filters__email"
        checked={filters.hasNoEmailAddress}
        color={Color.Secondary}
        onClick={handleCheckboxClick}
      />
      <Text>{t('hasNoEmail')}</Text>
    </div>
  );
};
