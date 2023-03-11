import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class Appnav extends Component{
  render(){

    const navigation = this.props.navigation;

    return(
        <View>
          <Text>App Nav</Text>
        </View>
    );
  }
}
