import { Camera, CameraType, PermissionStatus } from 'expo-camera';
import { useEffect, useState } from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App(props) {
  const [type, setType] = useState(CameraType.back);
  const [permission, setPermission] = useState(null);
  const [camera, setCamera] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setPermission(status === PermissionStatus.GRANTED);
    })();
  }, []);

  function toggleCameraType() {
    setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
    console.log('Camera: ', type);
  }

  async function takePhoto() {
    if (camera) {
      const options = { quality: 0.5, base64: true, onPictureSaved: (data) => sendToServer(data) };
      const data = await camera.takePictureAsync(options);

      console.log(data.uri);
    }
  }

  async function sendToServer(data) {
    console.log('HERE', data.uri);

    const userId = await AsyncStorage.getItem('whatsthat_user_id');

    const res = await fetch(data.uri);
    const blob = await res.blob();

    return fetch(
      `http://127.0.0.1:3333/api/1.0.0/user/${userId}/photo`,
      {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'image/png',
        },
        body: blob,
      },
    )
      .then(async (response) => {
        if (response.status === 200) {
          console.log('Picture added', response);
        } else if (response.status === 400) {
          console.log('Bad Request');
        } else if (response.status === 401) {
          console.log('Unauthorized');
        } else if (response.status === 403) {
          console.log('Forbidden');
        } else if (response.status === 404) {
          console.log('Not Found');
        } else if (response.status === 500) {
          console.log('Server Error');
        } else {
          console.log('Something went wrong');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  if (permission === null) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.centeredText}>Waiting for permission...</Text>
        <TouchableOpacity style={styles.returnButton} onPress={() => props.navigation.goBack()}>
          <Text style={styles.returnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  } if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.centeredText}>Cannot access camera</Text>
        <TouchableOpacity style={styles.returnButton} onPress={() => props.navigation.goBack()}>
          <Text style={styles.returnText}>Return to menu</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.goBack()}>
            <Text style={styles.text}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto} />
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    width: '100%',
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  flipButton: {
    flex: 1,
    backgroundColor: '007bff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    alignItems: 'center',
    bottom: 0,
    height: 80,
    width: 80,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 40,
    backgroundColor: 'transparent',
  },
  backButton: {
    flex: 1,
    backgroundColor: '007bff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centeredText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 30,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  returnButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  returnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
