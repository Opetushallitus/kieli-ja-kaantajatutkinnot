import SearchIcon from '@mui/icons-material/Search';
//import { Box, TextField } from '@mui/material';
import { useRef } from 'react';
import { CustomButton, H3 } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';

export const PublicExamSessionFilters = () => {
  // I18
  const translateCommon = useCommonTranslation();

  const filtersGridRef = useRef<HTMLInputElement>(null);
  const scrollToSearch = () => {
    filtersGridRef.current?.scrollIntoView({
      block: 'end',
      inline: 'nearest',
    });
  };

  // TODO Fixme
  const searchButtonDisabled = false;
  const handleEmptyBtnClick = scrollToSearch;
  // eslint-disable-next-line no-console
  const handleSearchBtnClick = () => console.log('empty btn clicked..');

  // TODO Renders just the headers for now, add actual filters + logic
  return (
    <div className="public-exam-session-filters" ref={filtersGridRef}>
      <div className="public-exam-session-filters__filter-box">
        <div className="public-exam-session-filters__filter">
          <div className="columns gapped-xxs">
            <H3>{translateCommon('language')}</H3>
          </div>
        </div>
        <div className="public-exam-session-filters__filter">
          <H3>{translateCommon('level')}</H3>
        </div>
        <div className="public-exam-session-filters__filter">
          <H3> {translateCommon('municipality')}</H3>
        </div>
      </div>
      <div className="public-exam-session-filters__btn-box">
        <CustomButton
          data-testid="public-exam-session-filters__filter__empty-btn"
          color={Color.Secondary}
          variant={Variant.Outlined}
          onClick={handleEmptyBtnClick}
        >
          {translateCommon('buttons.empty')}
        </CustomButton>
        <CustomButton
          disabled={searchButtonDisabled}
          data-testid="public-exam-session-filters__filter__search-btn"
          color={Color.Secondary}
          variant={Variant.Contained}
          onClick={handleSearchBtnClick}
          startIcon={<SearchIcon />}
        >
          {`${translateCommon('buttons.search')} (1337)`}
        </CustomButton>
      </div>
    </div>
  );
};
