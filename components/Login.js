import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SignupScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value != null) {
      this.props.navigation.navigate('Apptab');
    }
  };

  handleLogin = () => {
    const { email, password } = this.state;
    if (!email || !password) {
      this.setState({ error: 'Please fill out all fields.' });
    } else {
      this.login();
    }
  };

  login() {
    return fetch(
      'http://127.0.0.1:3333/api/1.0.0/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password,
        }),
      },
    )
      .then((response) => {
        if (response.status === 200) {
          this.setState({ error: 'Login Successful!' });
          return response.json();
        } if (response.status === 400) {
          this.setState({ error: 'Incorrect email or passowrd' });
        } else if (response.status === 401) {
          this.setState({ error: 'Unauthorised' });
        } else if (response.status === 403) {
          this.setState({ error: 'Forbidden' });
        } else if (response.status === 404) {
          this.setState({ error: 'Not Found' });
        } else if (response.status === 500) {
          this.setState({ error: 'Server error 500' });
        } else {
          this.setState({ error: 'An error has occured' });
        }
      })
      .then(async (rJson) => {
        console.log(rJson);
        try {
          await AsyncStorage.setItem('whatsthat_user_id', rJson.id);
          await AsyncStorage.setItem('whatsthat_session_token', rJson.token);

          this.props.navigation.navigate('Appnav');
        } catch {
          this.setState({ error: 'An error has occured' });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const { email, password, error } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Login Page</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(value) => this.setState({ email: value })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(value) => this.setState({ password: value })}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('Signup')}>
          <Text style={styles.buttonText}>Signup here</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default SignupScreen;
