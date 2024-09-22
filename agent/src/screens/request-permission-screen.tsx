import React from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {PermissionFallbackProps} from '../types/permission-request';

function SettingsButton() {
  const handlePress = () => {
    Linking.openSettings();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Text style={{color: styles.button.color}}>Open Settings</Text>
    </TouchableOpacity>
  );
}

export function RequestPermissionScreen({request, status, requestPermission}: PermissionFallbackProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Permission Required</Text>
        <Text style={styles.name}>{request.name}</Text>
        <Text style={styles.reason}>{request.reason}</Text>
        {status === 'denied' ? (
          <TouchableOpacity onPress={requestPermission} style={styles.button}>
            <Text style={{color: styles.button.color}}>Grant Permission</Text>
          </TouchableOpacity>
        ) : (
          <SettingsButton />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    padding: 20,
  },
  card: {
    padding: 24,
    elevation: 2,
    shadowColor: '#ddd',
    borderRadius: 6,
  },
  heading: {
    fontWeight: '600',
    fontSize: 24,
    color: '#000',
    marginBottom: 6,
  },
  name: {
    fontSize: 20,
  },
  reason: {
    marginBottom: 12,
  },
  button: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#00a6fb',
    color: '#fff',
  },
});
