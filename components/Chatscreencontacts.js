import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableHighlight, TouchableOpacity } from 'react-native';

class ContactItem extends Component {
  handleAddButton = (contact) => {
    const user_id = contact.user_id;
    this.props.addUser(user_id);
  };

  render() {
    const { item, onPress } = this.props;
    const { first_name, last_name } = item;

    return (
      <TouchableHighlight underlayColor="#ddd" onPress={() => onPress(item)}>
        <View style={styles.contactItem}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{first_name + " " + last_name}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => this.handleAddButton(item)}>
            <Text style={styles.addButtonText}>Add</Text>
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
      chat_id: '',
    };
  }

  handleContactPress = (contact) => {
    const user_id = contact.user_id;
  };

  renderContactItem = ({ item }) => (
    <ContactItem item={item} onPress={this.handleContactPress} addUser={this.addUser} />
  );

  async componentDidMount() {
    const chat_id = await AsyncStorage.getItem("whatsthat_chat_id");
    this.setState({ chat_id });

    this.checkLoggedIn();
    const userContacts = await this.getContacts();
    const chatData = await this.loadChatData(chat_id);
    const chatMembers = chatData.members;

    const addableContacts = userContacts.filter(contact => {
      return !chatMembers.find(member => member.user_id === contact.user_id);
    });

    this.setState({ userData: addableContacts });

    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      this.checkLoggedIn();
      const userContacts = await this.getContacts();
      const chatData = await this.loadChatData(chat_id);
      const chatMembers = chatData.members;

      const addableContacts = userContacts.filter(contact => {
        return !chatMembers.find(member => member.user_id === contact.user_id);
      });

      this.setState({ userData: addableContacts });
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

  getContacts = async () => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/contacts',
    {
      method: 'GET',
      headers: { 
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then(async (response) => {
      if (response.status === 200) {
        console.log('Sucessfully got contacts')
        const rJson = await response.json();
        return rJson; // return the contacts
      } else if (response.status === 401) {
        console.log('Unauthorized')
      } else if (response.status === 500) {
        console.log('Server Error')
      } else {
        console.log('Something went wrong')
      }
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
        if (response.status === 200) {
            await AsyncStorage.removeItem("whatsthat_session_token")
            await AsyncStorage.removeItem("whatsthat_user_id")
            this.props.navigation.navigate('Login')
        } else if (response.status === 401) {
            console.log("Unauthorised")
            await AsyncStorage.removeItem("whatsthat_session_token")
            await AsyncStorage.removeItem("whatsthat_user_id")
            this.props.navigation.navigate('Login')
        } else if (response.status === 500) {
          console.log("Server Error")
        } else {
            this.setState({ error: 'An error has occured' });
        }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  addUser = async (user_id) => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + this.state.chat_id + '/user/' + user_id,
    {
        method: 'POST',
        headers: { 
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
          "Content-Type": "application/json"
        },
    })
    .then(async (response) => {
        if (response.status === 200) {
          console.log("User added successfully");

          const userContacts = await this.getContacts();
          const chatData = await this.loadChatData(this.state.chat_id);
          const chatMembers = chatData.members;

          const { name, creator, members } = chatData;

          console.log(members);

          // Filter out any contacts that are already in the chat.
          const addableContacts = userContacts.filter(contact => {
            return !chatMembers.find(member => member.user_id === contact.user_id);
          });

          this.setState({ userData: addableContacts });
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
          this.setState({ error: 'An error has occured' });
          this.setState({errorDetails: `Status: ${response.status}, Status Text: ${response.statusText}`});
        }
    })
    .catch((error) => {
      console.error(error);
      console.log("Response Body: ", error.response.text());
    });
  };

  loadChatData = async (chat_id) => {
    try {
      const response = await fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + chat_id, {
        method: 'GET',
        headers: {
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
        },
      });

      if (response.status === 200) {
        console.log('Successfully loaded chat')
        const chatData = await response.json();
        this.setState({ chatData, loading: false });
        return chatData;
      } else if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 403) {
        console.log('Forbidden');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else if (response.status === 500) {
        console.log('Server Error');
      } else {
        console.error("Something went wrong", response.status);
      }
    } catch (error) {
      console.error(error);
    }
  }

  goToSearch = () => {
    this.props.navigation.navigate('Contactsearch');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Members</Text>
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
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
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
});

export default ChatScreenContacts;