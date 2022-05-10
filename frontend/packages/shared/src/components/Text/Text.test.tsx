import renderer from 'react-test-renderer';

import { Caption, H1, H2, H3, H4, H5, H6, Text } from './Text';

describe('Caption', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<Caption>This is a caption</Caption>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

describe('H1', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<H1>This is an H1</H1>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

describe('H2', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<H2>This is an H2</H2>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

describe('H3', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<H3>This is an H3</H3>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

describe('H4', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<H4>This is an H4</H4>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

describe('H5', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<H5>This is an H5</H5>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

describe('H6', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<H6>This is an H6</H6>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

describe('Text', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<Text>This is just text</Text>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
