const React = require('react');
const { View, Text } = require('react-native');

// Mock do MoovIcon baseado no uso no componente
const MoovIcon = ({ name, size, color, ...props }) => {
  return React.createElement(
    View,
    { testID: `moov-icon-${name}`, ...props },
    React.createElement(Text, { style: { fontSize: size, color } }, name)
  );
};

// Mock do DefaultTheme
const DefaultTheme = {
  colors: {
    white: 'white',
    gray: {
      contrast: 'white',
    },
  },
  fontSizes: {
    M: 16,
  },
  fontWeight: {
    normal: 'normal',
    bold: 'bold',
  },
};

// Mock do Typography
const Typography = ({ children, ...props }) => {
  return React.createElement(Text, props, children);
};

module.exports = {
  MoovIcon,
  DefaultTheme,
  Typography,
};
