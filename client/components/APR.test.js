import React from 'react';
import APR from './APR';
import renderer from 'react-test-renderer';

jest.mock('./History', () => ()=>
    <div id="mockHistory"></div>
);

test('renders APR test page', () => {
  const component = renderer.create(
    <APR />,
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});