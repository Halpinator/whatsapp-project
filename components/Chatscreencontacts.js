import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { res } from 'react-email-validator';
import { StyleSheet, Text, View, FlatList, Image, TouchableHighlight, TouchableOpacity } from 'react-native';

class ContactItem extends Component {
  constructor(props){
    super(props);
    this.state ={ 
      isLoading: true,
      contactListData: [],
      user_id: ''
    }
  }

  handleRemoveButton = (contact) => {
    const user_id = contact.user_id;
    this.removeContact(user_id).then(() => {
      this.props.getContacts();
    });
  };

  removeContact = async (user_id) => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/user/' + user_id + '/contact',
    {
      method: 'DELETE',
      headers: { 
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then(async (response) => {
      console.log(response)
      const rText = await response.text();
      console.log(rText);
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    const { item, onPress } = this.props;

    const { first_name, last_name} = item;

    const navigation = this.props.navigation;

    return (
      <TouchableHighlight underlayColor="#ddd" onPress={() => onPress(item)}>
        <View style={styles.contactItem}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{first_name + " " +  last_name}</Text>
          </View>
          <TouchableOpacity style={styles.removeButton} onPress={() => this.handleRemoveButton(item)}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </TouchableHighlight>
    );
  }
}

class ChatScreenContacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: [],
      user_id: '',
      selectedContacts: []
    };
  }

  handleContactPress = (contact) => {
    const user_id = contact.user_id;
  };

  renderContactItem = ({ item }) => (
    <ContactItem item={item} onPress={this.handleContactPress} getContacts={this.getContacts} />
  );

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getContacts();
    });
  }
  
  componentWillUnmount() {
    this.unsubscribe();
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login')
    }
  }

  getContacts = async () => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/contacts',
    {
      method: 'GET',
      headers: { 
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then(async (response) => {
      console.log(response.status)
      console.log(response.statusText)
      const rJson = await response.json();
      console.log(rJson);
      this.setState({ userData: rJson });
    })
    .catch((error) => {
      console.error(error);
    });
  }

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
            await AsyncStorage.removeItem("whatsthat_user_id")
            this.props.navigation.navigate('Login')
        }else if (response.status === 401) {
            console.log("Unauthorised")
            await AsyncStorage.removeItem("whatsthat_session_token")
            await AsyncStorage.removeItem("whatsthat_user_id")
            this.props.navigation.navigate('Login')
        }else{
            this.setState({ error: 'An error has occured' });
        }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  goToSearch = () => {
    this.props.navigation.navigate('Contactsearch')
  }

  render() {

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Members</Text>
        </View>
        <FlatList
          data={this.state.userData}
          renderItem={this.renderContactItem}
          keyExtractor={(item) => item.user_id.toString()}
          style={styles.contactList}
        />
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
    width: '100%',
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
  addButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  header: {
    height: 60,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    flex: 1,
  },
  removeButton: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreenContacts;