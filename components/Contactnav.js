import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableHighlight, TouchableOpacity } from 'react-native';

const CONTACTS = [
  {
    id: 1,
    name: 'John Doe',
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
    messages: [
      { id: 1, content: 'Hello there!', time: '10:00 AM' },
      { id: 2, content: 'How are you?', time: '10:05 AM' },
      { id: 3, content: 'See you soon!', time: '11:00 AM' },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
    messages: [
      { id: 1, content: 'Hey, what\'s up?', time: '9:00 AM' },
      { id: 2, content: 'Want to grab lunch?', time: '12:00 PM' },
    ],
  },
];

class ContactItem extends Component {
  constructor(props){
    super(props);
    this.state ={ 
      isLoading: true,
      contactListData: []
    }
  }


  render() {
    const { item, onPress } = this.props;
    const { name, profilePic, messages } = item;
    const lastMessage = messages[messages.length - 1];

    const navigation = this.props.navigation;

    return (
      <TouchableHighlight underlayColor="#ddd" onPress={() => onPress(item)}>
        <View style={styles.contactItem}>
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{name}</Text>
            <Text style={styles.lastMessage}>{lastMessage.content}</Text>
          </View>
          <Text style={styles.messageTime}>{lastMessage.time}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

class ContactsPage extends Component {
  handleContactPress = (contact) => {
    // Handle contact press
  };

  renderContactItem = ({ item }) => (
    <ContactItem item={item} onPress={this.handleContactPress} />
  );

  logout = async () => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/logout',
    {
        method: 'POST',
        headers: { 
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
        }
    })
    .then(async (response) => {
        if(response.status === 200) {
            await AsyncStorage.removeItem("whatsthat_session_token")
            await AsyncStorage.removeItem("whatsthat_session_token")
            this.props.navigation.navigate('Login')
        }else if (response.status === 401) {
            console.log("Unauthorised")
            await AsyncStorage.removeItem("whatsthat_session_token")
            await AsyncStorage.removeItem("whatsthat_session_token")
            this.props.navigation.navigate('Login')
        }else{
            this.setState({ error: 'An error has occured' });
        }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {

    return (
      <View style={styles.container}>
        <FlatList
          data={CONTACTS}
          renderItem={this.renderContactItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.contactList}
        />
        <TouchableOpacity style={styles.button} onPress={this.logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  contactList: {
    paddingHorizontal: 12,
  },
  contactItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 16,
    color: '#777',
  },
  messageTime: {
    fontSize: 12,
    color: '#777',
    marginLeft: 12,
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
});

export default ContactsPage;