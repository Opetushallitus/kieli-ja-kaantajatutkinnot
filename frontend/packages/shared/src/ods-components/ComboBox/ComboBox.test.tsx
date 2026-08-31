import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ComboBox } from './ComboBox';
import { TextFieldVariant } from '../../enums';

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
