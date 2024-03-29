import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableHighlight, TouchableOpacity, Image,
} from 'react-native';

class ContactItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photo: null,
    };
  }

  async componentDidMount() {
    const { item } = this.props;
    this.getProfileImage(item.user_id);
  }

  getProfileImage = async (userId) => fetch(
    `http://127.0.0.1:3333/api/1.0.0/user/${userId}/photo`,
    {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    },
  )
    .then(async (response) => {
      if (response.status === 200) {
        console.log('Photo successfully pulled');
        const resBlob = await response.blob();
        const data = URL.createObjectURL(resBlob);
        console.log(data);

        this.setState({
          photo: data,
        });
      } else if (response.status === 401) {
        console.log('Unauthorized');
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
      this.setState({ photo: null });
    });

  handleAddButton = (contact) => {
    const { user_id } = contact;
    this.props.addUser(user_id);
  };

  render() {
    const { item, onPress } = this.props;
    const { first_name, last_name } = item;

    const initials = first_name[0] + last_name[0];

    return (
      <TouchableHighlight underlayColor="#ddd" onPress={() => onPress(item)}>
        <View style={styles.contactItem}>
          {this.state.photo ? (
            <Image style={styles.contactImage} source={{ uri: this.state.photo }} />
          ) : (
            <View style={styles.contactInitialsContainer}>
              <Text style={styles.contactInitials}>{initials.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{`${first_name} ${last_name}`}</Text>
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

  async componentDidMount() {
    const chat_id = await AsyncStorage.getItem('whatsthat_chat_id');
    this.setState({ chat_id });

    this.checkLoggedIn();
    const userContacts = await this.getContacts();
    const chatData = await this.loadChatData(chat_id);
    const chatMembers = chatData.members;

    const addableContacts = userContacts.filter((contact) => !chatMembers.find((member) => member.user_id === contact.user_id));

    this.setState({ userData: addableContacts });

    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      this.checkLoggedIn();
      const userContacts = await this.getContacts();
      const chatData = await this.loadChatData(chat_id);
      const chatMembers = chatData.members;

      const addableContacts = userContacts.filter((contact) => !chatMembers.find((member) => member.user_id === contact.user_id));

      this.setState({ userData: addableContacts });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleContactPress = (contact) => {
    const { user_id } = contact;
  };

  renderContactItem = ({ item }) => (
    <ContactItem item={item} onPress={this.handleContactPress} addUser={this.addUser} />
  );

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  getContacts = async () => fetch(
    'http://127.0.0.1:3333/api/1.0.0/contacts',
    {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    },
  )
    .then(async (response) => {
      if (response.status === 200) {
        console.log('Sucessfully got contacts');
        const rJson = await response.json();
        return rJson;
      } if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 500) {
        console.log('Server Error');
      } else {
        console.log('Something went wrong');
      }
    })
    .catch((error) => {
      console.error(error);
    });

  logout = async () => fetch(
    'http://127.0.0.1:3333/api/1.0.0/logout',
    {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    },
  )
    .then(async (response) => {
      if (response.status === 200) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        this.props.navigation.navigate('Login');
      } else if (response.status === 401) {
        console.log('Unauthorised');
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        this.props.navigation.navigate('Login');
      } else if (response.status === 500) {
        console.log('Server Error');
      } else {
        console.log('Something went wrong');
      }
    })
    .catch((error) => {
      console.error(error);
    });

  addUser = async (userId) => fetch(
    `http://127.0.0.1:3333/api/1.0.0/chat/${this.state.chat_id}/user/${userId}`,
    {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
    },
  )
    .then(async (response) => {
      if (response.status === 200) {
        console.log('User added successfully');

        const userContacts = await this.getContacts();
        const chatData = await this.loadChatData(this.state.chat_id);
        const chatMembers = chatData.members;

        const addableContacts = userContacts.filter((contact) => !chatMembers.find((member) => member.user_id === contact.user_id));

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
        console.log('An error has occured');
      }
    })
    .catch((error) => {
      console.error(error);
      console.log('Response Body: ', error.response.text());
    });

  loadChatData = async (chatId) => {
    try {
      const response = await fetch(`http://127.0.0.1:3333/api/1.0.0/chat/${chatId}`, {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });

      if (response.status === 200) {
        console.log('Successfully loaded chat');
        const chatData = await response.json();
        this.setState({ chatData, loading: false });
        return chatData;
      } if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 403) {
        console.log('Forbidden');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else if (response.status === 500) {
        console.log('Server Error');
      } else {
        console.error('Something went wrong', response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

  goToSearch = () => {
    this.props.navigation.navigate('Contactsearch');
  };

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
    alignItems: 'center',
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
  contactImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: 10,
  },
  contactInitialsContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contactInitials: {
    color: 'white',
    fontSize: 18,
  },
});

export default ChatScreenContacts;
