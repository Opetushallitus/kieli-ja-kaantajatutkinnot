import { formatPersonIdentifier } from 'utils/person';

describe('formatPersonIdentifier', () => {
  it('prefers the social security number when both values exist', () => {
    expect(formatPersonIdentifier('020502E902X', '2002-05-02')).toBe(
      '020502E902X',
    );
  });

  it.each([undefined, null, ''])('uses the birthday when ssn is %s', (ssn) => {
    expect(formatPersonIdentifier(ssn, '2002-05-02')).toBe('2.5.2002');
  });

  it.each([undefined, null, '', 'invalid', '2002-02-31'])(
    'renders no date for %s',
    (date) => {
      expect(formatPersonIdentifier(null, date)).toBe('');
    },
  );
});
