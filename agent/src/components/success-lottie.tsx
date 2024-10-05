import React from 'react';
import LottieView from 'lottie-react-native';
import successLottie from '@assets/lottie/success.json';
import {StyleSheet} from 'react-native';

type Props = {
  onAnimationFinish?: () => void;
};

export function SuccessLottie({onAnimationFinish}: Props) {
  return <LottieView source={successLottie} autoPlay loop={false} style={styles.lottie} onAnimationFinish={onAnimationFinish} />;
}

const styles = StyleSheet.create({
  lottie: {
    width: 240,
    height: 240,
  },
});
