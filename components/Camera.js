import { Camera, CameraType, PermissionStatus } from 'expo-camera';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    console.log("Camera: ", type)
  }

  async function takePhoto(){
    if(camera){
        const options = {quality: 0.5, base64: true, onPictureSaved: (data) => sendToServer(data)}
        const data = await camera.takePictureAsync(options)

        console.log(data.uri)
    }
  }


  async function sendToServer(data){
    console.log("HERE", data.uri)

    const user_id = await AsyncStorage.getItem("whatsthat_user_id");

    let res = await fetch(data.uri);
    let blob = await res.blob()

    return fetch('http://127.0.0.1:3333/api/1.0.0/user/' + user_id + '/photo',
    {
        method: 'POST',
        headers: { 
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
          "Content-Type": "image/png"
        },
        body: blob
    })
    .then(async (response) => {
        if(response.status === 200) {
          console.log("Picture added", response)
        }else if (response.status === 401) {
          console.log("Unauthorised")
        }else{
          console.log('An error has occured');
        }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  if(permission === null){
    return (<Text>Waiting for permission</Text>);
  } else if (!permission) {
    return (<Text>No access to camera</Text>);
  } else {
    return (
        <View style={styles.container}>
          <Camera style={styles.camera} type={type} ref={ref => setCamera(ref)}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={takePhoto}>
                    <Text style={styles.text}>Take Photo</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => props.navigation.goBack()}>
                  <Text style={styles.text}>Go back</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
    );
  }  
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    buttonContainer: {
        alignSelf: 'flex-end',
        padding: 5,
        margin: 5,
        backgroundColor: 'steelblue'
    },
    button: {
        width: '100%',
        height: '100%'
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ddd'
    }
})

