import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableHighlight, TouchableOpacity, TextInput, Button } from 'react-native';

class ContactItem extends Component {
  render() {
    const { item, onPress } = this.props;
    const { given_name, family_name } = item;

    return (
      <TouchableHighlight underlayColor="#ddd" onPress={() => onPress(item)}>
        <View style={styles.contactItem}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{given_name + ' ' + family_name}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

class ContactsSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: [],
      searchInput: '',
    };
  }

  handleContactPress = (contact) => {
    const user_id = contact.user_id;
    this.addContact(user_id);
  };

  renderContactItem = ({ item }) => (
    <ContactItem item={item} onPress={this.handleContactPress} />
  );

  handleSearchInput = (text) => {
    this.setState({ searchInput: text });
  };

  handleSearchButtonPress = () => {
    // You can handle your search logic here.
    console.log('Search button pressed. Search input:', this.state.searchInput);
    //this.searchUsers(this.state.searchInput);
    this.updateContactList(this.state.searchInput);
  };

  updateContactList = async (search) => {
    const addedContacts = await this.getContacts();
    const allUsers = await this.searchUsers(search);
    const currentUserId = parseInt(await AsyncStorage.getItem("whatsthat_user_id"));

    const nonAddedUsers = allUsers.filter(user => !addedContacts.some(contact => contact.user_id === user.user_id) && user.user_id !== currentUserId);
    
    this.setState({ userData: nonAddedUsers });
  };

  async componentDidMount() {
    this.updateContactList();

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.searchUsers();
      this.getContacts();
      this.updateContactList();
    });
  }
  
  componentWillUnmount() {
    this.unsubscribe();
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  }

  searchUsers = async (search) => {

    let request = '';

    if (search === undefined || search.trim() === '') {
      request = '';
    } else {
      request = 'q=' + search + '&';
    }

    console.log(search);
    console.log(request);

    return fetch('http://127.0.0.1:3333/api/1.0.0/search?' + request + 'search_in=all&limit=20&offset=0',
    {
      method: 'GET',
      headers: { 
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then(async (response) => {
      console.log(response)
      const rJson = await response.json();
      console.log(rJson);
      return rJson; // return the contacts
    })
    .catch((error) => {
      console.error(error);
    });
  }

  addContact = async (user_id) => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/user/' + user_id + '/contact',
    {
      method: 'POST',
      headers: { 
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      },
      body: JSON.stringify({
        user_id: user_id,
      })
    })
    .then(async (response) => {
      console.log(response)
      this.updateContactList();
    })
    .catch((error) => {
      console.error(error);
    });
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
      return rJson; // return the contacts
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search</Text>
        </View>
        <FlatList
          data={this.state.userData}
          renderItem={this.renderContactItem}
          keyExtractor={(item) => item.user_id.toString()}
          style={styles.contactList}
        />
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            onChangeText={this.handleSearchInput}
            value={this.state.searchInput}
            placeholder="Enter a name"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={this.handleSearchButtonPress}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
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
  backButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchButton: {
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ContactsSearchPage;