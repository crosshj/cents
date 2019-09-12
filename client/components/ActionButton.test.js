import React from 'react';
import ActionButton from './ActionButton';
import renderer from 'react-test-renderer';

describe('floating action button', () => {

  it('renders initial view', () => {
    const component = renderer.create(
      <ActionButton />,
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('changes menu state to open when main button clicked', () => {
    const component = renderer.create(
      <ActionButton />,
    );
    const mainMenu = component.root.findByProps({ className: 'mfb-slidein mfb-component--br'})
    var mainMenuState = mainMenu.props['data-mfb-state'];
    expect(mainMenuState).toBe('closed');

    const button = component.root.findByProps({className: 'mfb-component__button--main'});
    const eventMock = { preventDefault: jest.fn() };
    button.props.onClick(eventMock);

    mainMenuState = mainMenu.props['data-mfb-state'];
    expect(mainMenuState).toBe('open');
  });

  it('calls onChoose function when child button is clicked', () => {
    const onChoose = jest.fn();

    const component = renderer.create(
      <ActionButton onChoose={onChoose}/>,
    );

    const childButtons = component.root.findAllByProps({className: 'mfb-component__button--child'});
    childButtons.forEach(child => child.props.onClick());

    expect(onChoose).toBeCalledWith('dollar');
    expect(onChoose).toBeCalledWith('group');
    expect(onChoose).toBeCalledWith('refresh');

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});


