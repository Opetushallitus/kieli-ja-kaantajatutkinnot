import { Box, Paper } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CustomButton,
  CustomTextField,
  H1,
  H3,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { TopControls } from 'components/clerkInterpreter/overview/TopControls';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  resetClerkPersonSearchStatus,
  searchClerkPerson,
} from 'redux/reducers/clerkPersonSearch';
import { clerkPersonSearchSelector } from 'redux/selectors/clerkPersonSearch';

export const ClerkPersonSearchPage = () => {
  const { t } = useAppTranslation({ keyPrefix: 'otr' });
  const navigate = useNavigate();

  // State
  const [identityNumber, setIdentityNumber] = useState('');
  const [searchDisabled, setSearchDisabled] = useState(true);
  const [fieldError, setFieldError] = useState('');

  // Redux
  const { status, person } = useAppSelector(clerkPersonSearchSelector);
  const isLoading = status == APIResponseStatus.InProgress;
  const personNotFound = status == APIResponseStatus.Success && !person;
  const dispatch = useAppDispatch();

  const handleIdentityNumberChange =
    () => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setIdentityNumber(value);
      setSearchDisabled(getIdentityCodeError(value).length > 0);
    };

  const handleIdentityNumberErrors =
    () => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const error = getIdentityCodeError(event.target.value);
      setFieldError(error ? t(error) : '');
    };

  const getIdentityCodeError = (value: string) => {
    return InputFieldUtils.inspectCustomTextFieldErrors(
      TextFieldTypes.PersonalIdentityCode,
      value
    );
  };

  const handleSearch = () => {
    dispatch(searchClerkPerson(identityNumber));
  };

  const handleProceed = () => {
    navigate(AppRoutes.ClerkNewInterpreterPage);
  };

  useEffect(() => {
    return () => {
      dispatch(resetClerkPersonSearchStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (status === APIResponseStatus.Success && person) {
      navigate(AppRoutes.ClerkNewInterpreterPage);
    }
  }, [navigate, status, person]);

  return (
    <Box className="clerk-person-search-page">
      <H1>{t('pages.clerkPersonSearchPage.title')}</H1>
      <Paper
        elevation={3}
        className="clerk-person-search-page__content-container rows"
      >
        <TopControls />
        <div className="rows gapped">
          <div className="columns margin-top-lg">
            <div className="columns margin-top-lg grow">
              <H3>
                {personNotFound
                  ? t('pages.clerkPersonSearchPage.noResult.label')
                  : t('pages.clerkPersonSearchPage.search.label')}
              </H3>
            </div>
          </div>
          <div className="columns">
            <Text>
              {personNotFound
                ? t('pages.clerkPersonSearchPage.noResult.description')
                : t('pages.clerkPersonSearchPage.search.description')}
            </Text>
          </div>
          <div className="columns gapped margin-top-lg">
            <CustomTextField
              className="clerk-person-search-page__ssn__field"
              data-testid="clerk-person-search-page__ssn__field"
              label={t('pages.clerkPersonSearchPage.placeholder')}
              value={identityNumber}
              onChange={handleIdentityNumberChange()}
              onBlur={handleIdentityNumberErrors()}
              error={fieldError.length > 0 || personNotFound}
              helperText={fieldError}
              sx={{
                '& .MuiFormHelperText-root': {
                  height: 0,
                },
              }}
            />
            <div className="columns">
              <LoadingProgressIndicator isLoading={isLoading}>
                <CustomButton
                  data-testid="clerk-person-search-page__ssn__search-button"
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  disabled={searchDisabled || isLoading}
                  onClick={handleSearch}
                >
                  {t('pages.clerkPersonSearchPage.buttons.search')}
                </CustomButton>
              </LoadingProgressIndicator>
            </div>
          </div>
          <div className="columns margin-top-lg">
            {personNotFound && (
              <CustomButton
                data-testid="clerk-person-search-page__proceed-button"
                variant={Variant.Outlined}
                color={Color.Secondary}
                onClick={handleProceed}
              >
                {t('pages.clerkPersonSearchPage.buttons.proceed')}
              </CustomButton>
            )}
          </div>
        </div>
      </Paper>
    </Box>
  );
};
