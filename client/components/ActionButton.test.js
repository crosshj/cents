import React from 'react';
import ActionButton from './ActionButton';
import renderer from 'react-test-renderer';

test('renders in initial state', () => {
  const component = renderer.create(
    <ActionButton />,
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('changes class when clicked', () => {
  const component = renderer.create(
    <ActionButton />,
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  // manually trigger the callback
  const button = component.root.findByProps({className: 'mfb-component__button--main'});
  const eventMock = { preventDefault: jest.fn() };
  button.props.onClick(eventMock);

  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});