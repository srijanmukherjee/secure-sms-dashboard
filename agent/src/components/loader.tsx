import React from 'react';
import LottieView from 'lottie-react-native';
import loaderLottie from '@assets/lottie/loader.json';
import {StyleSheet} from 'react-native';

export function Loader() {
  return <LottieView source={loaderLottie} autoPlay loop speed={0.75} style={styles.lottie} />;
}

const styles = StyleSheet.create({
  lottie: {
    width: 50,
    height: 50,
  },
});
