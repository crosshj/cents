import React from 'react';
import APR from './APR';
import renderer from 'react-test-renderer';

jest.mock('./History', () => ()=>
<div id="mockHistory"></div>
);

describe('APR test page', () => {

  it('renders intitial view', () => {
    const component = renderer.create(
      <APR />,
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});