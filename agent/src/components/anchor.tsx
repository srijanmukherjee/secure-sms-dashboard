import React from 'react';
import {Linking, StyleProp, StyleSheet, Text, TextStyle} from 'react-native';

type Props = {
  href: string;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Anchor({href, children, style}: Props) {
  const handlePress = () => {
    Linking.openURL(href);
  };

  return (
    <Text style={[styles.anchor, style]} onPress={handlePress}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  anchor: {
    color: '#0066ff',
  },
});
