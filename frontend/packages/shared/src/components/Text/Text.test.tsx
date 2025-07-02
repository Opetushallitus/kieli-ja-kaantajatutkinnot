import { render } from '@testing-library/react';

import { Caption, H1, H2, H3, H4, H5, H6, Text } from './Text';

describe('Caption', () => {
  it('should render correctly', () => {
    const { container } = render(<Caption>This is a caption</Caption>);

    expect(container).toMatchSnapshot();
  });
});

describe('H1', () => {
  it('should render correctly', () => {
    const { container } = render(<H1>This is an H1</H1>);

    expect(container).toMatchSnapshot();
  });
});

describe('H2', () => {
  it('should render correctly', () => {
    const { container } = render(<H2>This is an H2</H2>);

    expect(container).toMatchSnapshot();
  });
});

describe('H3', () => {
  it('should render correctly', () => {
    const { container } = render(<H3>This is an H3</H3>);

    expect(container).toMatchSnapshot();
  });
});

describe('H4', () => {
  it('should render correctly', () => {
    const { container } = render(<H4>This is an H4</H4>);

    expect(container).toMatchSnapshot();
  });
});

describe('H5', () => {
  it('should render correctly', () => {
    const { container } = render(<H5>This is an H5</H5>);

    expect(container).toMatchSnapshot();
  });
});

describe('H6', () => {
  it('should render correctly', () => {
    const { container } = render(<H6>This is an H6</H6>);

    expect(container).toMatchSnapshot();
  });
});

describe('Text', () => {
  it('should render correctly', () => {
    const { container } = render(<Text>This is just text</Text>);

    expect(container).toMatchSnapshot();
  });
});
