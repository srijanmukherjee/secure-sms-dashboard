import {Route, useNavigation} from '@react-navigation/native';
import {Exception, getPairInfo, pairAccept, PairAcceptRequest} from 'common';
import React, {useState} from 'react';
import {StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {client} from 'src/api';
import {useApi} from 'src/hooks/use-api';
import {useBrowser} from 'src/hooks/use-browser';
import {browsers} from 'src/util/browsers';
import ExclaimationIcon from '@assets/img/icons/triangle-exclaimation.svg';
import {Apptheme} from 'src/config/theme';
import {DeviceInfoService} from 'src/services/device-info';
import {useConnectionContext} from 'src/context/connection-context';
import {translateError} from 'src/util/translators';
import {Loader} from 'src/components/loader';
import {SuccessLottie} from 'src/components/success-lottie';
import {useRepository} from 'src/context/database-context';

type RouteParams = {
  connectionId: string;
};

type Props = {
  route: Route<'flow.pairing', RouteParams>;
};

async function buildPairAcceptRequest(): Promise<PairAcceptRequest> {
  return {
    agentVersion: DeviceInfoService.getVersion(),
    deviceInfo: await DeviceInfoService.getDeviceInfo(),
    supportedAlgorithms: [],
  };
}

export function PairingScreen({route}: Props) {
  const {connectionId} = route.params;
  const contextRepository = useRepository('ContextRepository');
  const [loading, data, exception] = useApi(() => getPairInfo(client, connectionId), [connectionId]);
  const [isPairing, setPairing] = useState<boolean>(false);
  const [isPaired, setPaired] = useState<boolean>(false);
  const [pairingException, setPairingException] = useState<Exception | null>(null);
  const {setConnectionInfo} = useConnectionContext();
  const browser = useBrowser(data?.userAgent);
  const BrowserIcon = browsers[browser].icon;
  const navigation = useNavigation();

  const handlePairPress = async () => {
    if (data === undefined) {
      console.debug('pair was pressed when data is undefined');
      return;
    }

    setPairing(true);
    setPairingException(null);

    try {
      const pairAcceptRequest = await buildPairAcceptRequest();
      const response = await pairAccept(client, data.connectionId, pairAcceptRequest);
      if (response.connectionId !== data.connectionId) {
        console.error(`Expected connection id ${data.connectionId} but received ${response.connectionId}`);
        throw new Exception('connection id mismatch');
      }

      const dbOperations: Promise<void>[] = [];
      dbOperations.push(
        contextRepository.upsertOne({
          key: 'encryption_key',
          value: data.publicKey,
        }),
      );
      dbOperations.push(
        contextRepository.upsertOne({
          key: 'active_connection_id',
          value: data.connectionId,
        }),
      );
      await Promise.all(dbOperations);

      setPaired(true);
    } catch (error) {
      setPairingException(translateError(error));
    } finally {
      setPairing(false);
    }
  };

  const handleSuccessAnimationFinish = () => {
    setTimeout(() => {
      try {
        setConnectionInfo({connectionId});
      } catch (ex) {
        console.error(ex);
      }
    }, 500);
  };

  if (isPairing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={'transparent'} translucent barStyle={'dark-content'} />
        <View style={styles.centerContainer}>
          <Loader />
        </View>
      </SafeAreaView>
    );
  }

  if (isPaired) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={'transparent'} translucent barStyle={'dark-content'} />
        <View style={styles.centerContainer}>
          <SuccessLottie onAnimationFinish={handleSuccessAnimationFinish} />
        </View>
      </SafeAreaView>
    );
  }

  if (pairingException) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={'transparent'} translucent barStyle={'dark-content'} />
        <View style={styles.centerContainer}>
          <Text style={styles.textCenter}>{pairingException.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'transparent'} translucent barStyle={'dark-content'} />
      {loading ? (
        <View style={styles.centerContainer}>
          <Loader />
        </View>
      ) : exception !== null ? (
        <View style={styles.centerContainer}>
          <Text style={styles.textCenter}>{exception.message}</Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <View style={styles.pairingContainer}>
            <BrowserIcon style={styles.browserIcon} />
            <Text style={styles.heading}>Pair with dashboard</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataHeading}>User Agent</Text>
              <Text style={styles.data}>{browser}</Text>
            </View>
            <View style={styles.dataContainer}>
              <Text style={styles.dataHeading}>Location</Text>
              <Text style={styles.data}>
                {data.location.zip}, {data.location.city}, {data.location.regionName}, {data.location.country}
              </Text>
            </View>
            <View style={styles.dataContainer}>
              <Text style={styles.dataHeading}>Connection id</Text>
              <Text style={[styles.data, styles.dataNoCapitalize]}>{data.connectionId}</Text>
            </View>

            <View style={styles.warning}>
              <ExclaimationIcon style={styles.warningIcon as any} />
              <Text style={styles.warningText}>Ensure the connection id matches with what you see on the dashboard screen</Text>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.pairButton]} onPress={handlePairPress}>
                <Text style={styles.buttonTextInvert}>Pair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textCenter: {
    textAlign: 'center',
  },
  pairingContainer: {
    padding: 24,
    width: '100%',
    shadowColor: '#ddd',
    borderRadius: 6,
    elevation: 10,
    position: 'relative',
    paddingTop: 72,
  },
  browserIcon: {
    height: 92,
    width: 92,
    maxHeight: 92,
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
  },
  heading: {
    fontSize: 24,
    color: '#2b2d42',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  dataContainer: {
    marginBottom: 10,
  },
  dataHeading: {
    fontSize: 14,
  },
  data: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  dataNoCapitalize: {
    textTransform: 'none',
  },
  warning: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fee4404f',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIcon: {
    color: '#ffb703',
  },
  warningText: {
    flex: 1,
    color: 'black',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 5,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#ddd',
    flex: 1,
  },
  pairButton: {
    backgroundColor: Apptheme.primaryColor,
  },
  buttonTextInvert: {
    fontSize: 16,
    color: 'white',
  },
  buttonText: {
    fontSize: 16,
  },
});
