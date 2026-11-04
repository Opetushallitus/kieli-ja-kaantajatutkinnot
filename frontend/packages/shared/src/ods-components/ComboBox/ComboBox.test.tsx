import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ComboBox, LabeledComboBox } from './ComboBox';
import { TextFieldVariant } from '../../enums';
import * as windowProperties from '../../hooks/useWindowProperties/useWindowProperties';
import { LanguageSelect } from '../LanguageSelect/LanguageSelect';

describe('ODS ComboBox', () => {
  it('should preserve floating label styles with the OPH theme', async () => {
    const user = userEvent.setup();
    const ophOutlinedInputTheme = createTheme({
      components: {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '&:has(input:focus-visible)': {
                outline: '2px solid black',
                zIndex: 9999,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                top: 0,
                legend: { lineHeight: 0 },
              },
            },
          },
        },
      },
    });

    const { container } = render(
      <ThemeProvider theme={ophOutlinedInputTheme}>
        <ComboBox
          label="Language"
          variant={TextFieldVariant.Outlined}
          values={[]}
          value={null}
          onChange={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText('Language')).toBeInTheDocument();
    expect(container.querySelector('.MuiInputLabel-root')).toHaveStyle({
      backgroundColor: 'background.paper',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.4375em',
      paddingLeft: '4px',
      paddingRight: '4px',
    });
    expect(container.querySelector('fieldset')).toHaveStyle({ top: '-5px' });
    expect(container.querySelector('legend')).toHaveStyle({
      lineHeight: '11px',
    });

    await user.click(screen.getByLabelText('Language'));
    expect(container.querySelector('.MuiOutlinedInput-root')).toHaveStyle({
      outline: 'none',
      zIndex: 0,
    });

    await user.tab();
    await user.tab({ shift: true });
    expect(container.querySelector('.MuiOutlinedInput-root')).toHaveStyle({
      outline: '2px solid black',
      zIndex: 0,
    });
  });
});

describe('ODS mobile dropdowns', () => {
  beforeEach(() => {
    jest.spyOn(windowProperties, 'useWindowProperties').mockReturnValue({
      isPhone: true,
    } as ReturnType<typeof windowProperties.useWindowProperties>);
  });

  afterEach(() => jest.restoreAllMocks());

  it('associates the external label and preserves blur validation', async () => {
    const user = userEvent.setup();
    const onBlur = jest.fn();
    const onChange = jest.fn();
    render(
      <LabeledComboBox
        id="country"
        label="Country"
        variant={TextFieldVariant.Outlined}
        values={[{ label: 'Finland', value: 'FI' }]}
        value={null}
        onChange={onChange}
        onBlur={onBlur}
        showError
        helperText="Choose a country"
      />,
    );

    const select = screen.getByRole('combobox', { name: 'Country' });
    expect(screen.getByLabelText('Country')).toBe(select);
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByText('Choose a country')).toHaveLength(1);
    await user.selectOptions(select, 'FI');
    expect(onChange).toHaveBeenCalledWith('FI');
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('preserves language selector accessibility, disabled state and option ordering', () => {
    render(
      <LanguageSelect
        id="language"
        aria-label="Exam language"
        disabled
        languages={['sv', 'fi', 'en']}
        primaryLanguages={['fi']}
        excludedLanguage="en"
        translateLanguage={(language) =>
          ({ fi: 'Finnish', sv: 'Swedish' })[language] || language
        }
        onLanguageChange={jest.fn()}
        variant={TextFieldVariant.Outlined}
        value={null}
      />,
    );

    const select = screen.getByRole('combobox', { name: 'Exam language' });
    expect(select).toHaveAttribute('id', 'language');
    expect(select).toBeDisabled();
    expect(
      screen.getAllByRole('option').map((option) => option.textContent),
    ).toEqual(['', 'Finnish', 'Swedish']);
  });
});
