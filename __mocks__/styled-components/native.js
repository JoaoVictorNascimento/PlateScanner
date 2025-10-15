import React from 'react';
import { Text } from 'react-native';

// Mock do styled-components/native
const styled = (Component) => {
  const StyledComponent = (props) => {
    return React.createElement(Component, {
      ...props,
      testID: props.testID || 'styled-component',
    });
  };
  
  StyledComponent.attrs = (attrsFn) => {
    return (styles) => {
      const StyledComponentWithAttrs = (props) => {
        const attrs = attrsFn ? attrsFn(props) : {};
        return React.createElement(Component, {
          ...props,
          ...attrs,
          testID: props.testID || 'styled-component',
        });
      };
      return StyledComponentWithAttrs;
    };
  };
  
  return StyledComponent;
};

export default styled;
