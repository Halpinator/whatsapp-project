import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

class SignupScreen extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      error: ''
    };
  }

  signUp(){
    return fetch('http://127.0.0.1:3333/api/1.0.0/user',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
        password: this.state.password
      })
    })
    .then((response) => {
      if(response.status === 201) {
        return response.json();
      }else if (response.status === 400) {
        throw "Email already exists or password isn't strong enough"
      }else{
        throw "An error has occured"
      }
    })
    .then(async (rJson) => {
      console.log(rJson)
      this.setState({ error: 'User successfully registered' });
      this.props.navigation.navigate('login')
    })
    .catch((error) => {
      console.error(error);
      this.setState({ error: 'An error has occured' });
    });
  }

  handleSignup = () => {
    const { first_name, last_name, email, password } = this.state;
    if (!first_name || !last_name || !email || !password) {
      this.setState({ error: 'Please fill out all fields.' });
    } else {
      this.signUp();
    }
  }

  render() {
    const { first_name, last_name, email, password, error } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Sign Up Page</Text>
        <TextInput 
          style={styles.input}
          placeholder="First Name"
          value={first_name}
          onChangeText={(value) => this.setState({ first_name: value })}
        />
        <TextInput 
          style={styles.input}
          placeholder="Surname"
          value={last_name}
          onChangeText={(value) => this.setState({ last_name: value })}
        />
        <TextInput 
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(value) => this.setState({ email: value })}
        />
        <TextInput 
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={(value) => this.setState({ password: value })}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={this.handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
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