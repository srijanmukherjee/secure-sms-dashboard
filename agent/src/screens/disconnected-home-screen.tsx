import React from 'react';
import {StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import MastSvg from '@assets/img/home_mast.svg';
import {Anchor} from 'src/components/anchor';
import {useNavigation} from '@react-navigation/native';
import {StackNavigation} from 'src/App';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Apptheme} from 'src/config/theme';

export function DisconnectedHomeScreen() {
  const navigation = useNavigation<StackNavigation>();

  const handleLinkDeviceButtonPress = () => {
    navigation.navigate('flow.disconnected.scan');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'transparent'} translucent barStyle={'dark-content'} />
      <View style={styles.mastContainer}>
        <MastSvg preserveAspectRatio="xMidYMid slice" />
      </View>
      <View>
        <Text style={styles.info}>Receive your sms securely on web dashboard.</Text>
        <Anchor style={styles.learnMore} href={'https://github.com/srijanmukherjee/secure-sms-dashboard'}>
          Learn more
        </Anchor>
      </View>
      <TouchableOpacity style={styles.linkButton} onPress={handleLinkDeviceButtonPress}>
        <Text style={styles.linkButtonText}>Link a device</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 10,
    padding: 20,
  },
  mastContainer: {
    borderRadius: 8.0,
    height: 240,
    overflow: 'hidden',
    marginBottom: 20,
  },
  info: {
    textAlign: 'center',
    fontSize: 14,
  },
  learnMore: {
    textAlign: 'center',
    fontSize: 14,
  },
  linkButton: {
    marginTop: 20,
    backgroundColor: Apptheme.primaryColor,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
