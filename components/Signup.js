import React, { Component } from 'react';
import { Text, View, Button, TextInput } from 'react-native';

export default class Signup extends Component{
  render(){

    const navigation = this.props.navigation;

    return(
        <View>
          <Text>Signup Screen</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
          />
          <TextInput>
          </TextInput>
        </View>
    );
  }
}
