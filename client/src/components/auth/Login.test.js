import React from 'react';
import Adapter from 'enzyme-adapter-react-16';

import { configure, shallow } from 'enzyme';
import Login from './Login'

configure({ adapter: new Adapter() });


describe('<Login />', () => {
    it('should load two inputs ', () => {
        const wrapper = shallow(<Login />)
        expect(wrapper.find(input)).toHaveLength(2);
    });
})