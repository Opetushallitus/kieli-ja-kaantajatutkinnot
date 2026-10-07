import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LabeledTextField } from './LabeledTextField';

it('keeps the accessible label, validation message and blur callback', async () => {
  const user = userEvent.setup();
  const onBlur = jest.fn();
  render(
    <OphThemeProvider variant="opintopolku" lang="en">
      <LabeledTextField
        id="email"
        label="Email *"
        placeholder="Use your personal email address"
        className="field-layout"
        sx={{ width: '240px' }}
        required
        error
        helperText="Enter a valid email address"
        onBlur={onBlur}
      />
    </OphThemeProvider>,
  );
  const input = screen.getByRole('textbox', { name: 'Email *' });
  expect(input).toBeRequired();
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('Enter a valid email address');
  expect(
    screen.getByText('Use your personal email address'),
  ).toBeInTheDocument();
  expect(input.closest('.field-layout')).toHaveStyle({ width: '240px' });
  expect(input.closest('.field-layout')).toContainElement(
    screen.getByText('Email *'),
  );
  await user.type(input, 'test');
  await user.tab();
  expect(onBlur).toHaveBeenCalled();
});

it('keeps authenticated details read-only and selectable', async () => {
  const user = userEvent.setup();
  render(
    <OphThemeProvider variant="opintopolku" lang="en">
      <LabeledTextField
        id="first-name"
        label="First name"
        value="Demo"
        slotProps={{ input: { readOnly: true } }}
      />
    </OphThemeProvider>,
  );
  const input = screen.getByRole('textbox', { name: 'First name' });
  expect(input).toHaveAttribute('readonly');
  expect(input).not.toBeDisabled();
  await user.type(input, 'Changed');
  expect(input).toHaveValue('Demo');
});
