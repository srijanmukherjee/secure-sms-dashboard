import React from 'react';
import {StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useRepository} from 'src/context/database-context';

export function ConnectedHomeScreen() {
  const contextRepository = useRepository('ContextRepository');

  const toggleBackgroundService = async () => {
    const backgroundServiceStatus = await contextRepository.fetchById('background_service_status');
    let nextValue: string;
    if (backgroundServiceStatus === null || backgroundServiceStatus.value === 'inactive') {
      nextValue = 'active';
    } else {
      nextValue = 'inactive';
    }

    await contextRepository.upsertOne({
      key: 'background_service_status',
      value: nextValue,
    });

    console.log(`Background Service: ${nextValue}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'transparent'} translucent barStyle={'dark-content'} />
      <View>
        <TouchableOpacity onPress={toggleBackgroundService}>
          <Text>Toggle Background Service</Text>
        </TouchableOpacity>
      </View>
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
});
