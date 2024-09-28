import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import MastSvg from '@assets/img/home_mast.svg';
import {Anchor} from 'src/components/anchor';

export function DisconnectedHomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mastContainer}>
        <MastSvg preserveAspectRatio="xMidYMid slice" />
      </View>
      <View>
        <Text style={styles.info}>Receive your sms securely on web dashboard.</Text>
        <Anchor style={styles.learnMore} href={'https://github.com/srijanmukherjee/secure-sms-dashboard'}>
          Learn more
        </Anchor>
      </View>
      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Link a device</Text>
      </TouchableOpacity>
    </View>
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
    backgroundColor: '#40BD77',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
