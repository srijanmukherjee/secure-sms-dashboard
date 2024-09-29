import {useNavigation} from '@react-navigation/native';
import React, {useRef} from 'react';
import {Dimensions, StatusBar, StyleSheet, Text, View} from 'react-native';
import {Camera, useCameraDevice, useCodeScanner} from 'react-native-vision-camera';
import {StackNavigation} from 'src/App';
import {QrOverlay} from 'src/components/qr-overlay';
import {validate as validateUUID} from 'uuid';

const {width, height} = Dimensions.get('screen');
const innerDimension = 300;
const qrDebounceTimeoutMs = 500;

export function QrCodeScannerScreen() {
  const navigation = useNavigation<StackNavigation>();
  const timeoutId = useRef<NodeJS.Timeout>();
  const previousCode = useRef<string>('');

  const cameraDevice = useCameraDevice('back');
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    // NOTE: Currently only iOS supports this parameter
    regionOfInterest: {
      x: width / 2 - innerDimension / 2,
      y: height / 2 - innerDimension / 2,
      height: innerDimension,
      width: innerDimension,
    },
    onCodeScanned: codes => {
      if (codes.length === 1 && codes[0].value !== undefined) {
        if (previousCode.current !== codes[0].value) {
          clearTimeout(timeoutId.current);
          previousCode.current = codes[0].value;
          handleQrCode(codes[0].value);
        }
      }
    },
  });

  const isConnectionRequestCode = (code: string) => {
    return validateUUID(code);
  };

  const handleQrCode = (code: string) => {
    if (!isConnectionRequestCode(code)) {
      return;
    }

    timeoutId.current = setTimeout(() => {
      navigation.navigate('flow.pairing', {
        connectionId: code,
      });
    }, qrDebounceTimeoutMs);
  };

  if (cameraDevice == null) {
    return <Text>Camera not found</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'transparent'} translucent barStyle={'light-content'} />
      <Camera device={cameraDevice} isActive={true} style={StyleSheet.absoluteFillObject} codeScanner={codeScanner} />
      <QrOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
