/* eslint-disable max-classes-per-file */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  StyleSheet, Text, View, FlatList, Image, TouchableHighlight, TouchableOpacity,
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

  handleRemoveButton = (contact) => {
    const { user_id } = contact;
    this.removeContact(user_id).then(() => {
      this.props.getContacts();
    });
  };

  removeContact = async (userId) => fetch(
    `http://127.0.0.1:3333/api/1.0.0/user/${userId}/contact`,
    {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    },
  )
    .then(async (response) => {
      if (response.status === 200) {
        console.log('Successfully removed contact');
      } else if (response.status === 400) {
        console.log('You cant remove yourself as a contact');
      } else if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 403) {
        console.log('Forbidden');
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
    });

  handleBlockButton = (contact) => {
    const { user_id } = contact;
    this.blockContact(user_id).then(() => {
      this.props.getContacts();
    });
  };

  blockContact = async (userId) => fetch(
    `http://127.0.0.1:3333/api/1.0.0/user/${userId}/block`,
    {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    },
  )
    .then(async (response) => {
      if (response.status === 200) {
        console.log(response);
        const rText = await response.text();
        console.log(rText);
      } else if (response.status === 400) {
        console.log('You cant block yourself');
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
    });

  render() {
    const { item, onPress } = this.props;
    const { first_name, last_name } = item;
    const initials = first_name[0] + last_name[0];

    return (
      <TouchableHighlight underlayColor="#ddd" onPress={() => onPress(item)}>
        <View style={styles.contactItem}>
          <TouchableOpacity style={styles.removeButton} onPress={() => this.handleRemoveButton(item)}>
            <View style={styles.removeSymbol} />
          </TouchableOpacity>
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
          <TouchableOpacity style={styles.blockButton} onPress={() => this.handleBlockButton(item)}>
            <Text style={styles.blockButtonText}>Block</Text>
          </TouchableOpacity>
        </View>
      </TouchableHighlight>
    );
  }
}

class ContactsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: [],
      currentUserInfo: [],
      photo: null,
    };
  }

  handleContactPress = (contact) => {
    const { user_id } = contact;
  };

  renderContactItem = ({ item }) => (
    <ContactItem item={item} onPress={this.handleContactPress} getContacts={this.getContacts} />
  );

  async componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      const userId = await AsyncStorage.getItem('whatsthat_user_id');
      this.checkLoggedIn();
      this.getContacts();
      this.getUserInfo(userId);
      this.getProfileImage(userId);
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
        console.log('Sucessfully loaded contacts');
        const rJson = await response.json();
        this.setState({ userData: rJson });
      } else if (response.status === 401) {
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

  getUserInfo = async (userId) => fetch(
    `http://127.0.0.1:3333/api/1.0.0/user/${userId}`,
    {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    },
  )
    .then(async (response) => {
      if (response.status === 200) {
        console.log('Successfully loaded user data');
        console.log(response.statusText);
        const rJson = await response.json();
        console.log(rJson);
        this.setState({ currentUserInfo: rJson });
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
    });

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
        console.log('Server error');
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        this.props.navigation.navigate('Login');
      } else {
        console.log({ error: 'An error has occured' });
      }
    })
    .catch((error) => {
      console.error(error);
    });

  render() {
    const { currentUserInfo, photo } = this.state;
    const { first_name, last_name } = currentUserInfo || {};
    const initials = currentUserInfo.first_name && currentUserInfo.last_name
      ? currentUserInfo.first_name[0] + currentUserInfo.last_name[0]
      : '';

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Camera')}>
            {photo ? (
              <Image style={styles.headerImage} source={{ uri: photo }} />
            ) : (
              <View style={styles.headerInitialsContainer}>
                <Text style={styles.headerInitials}>{initials.toUpperCase()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Hi
            {' '}
            {first_name}
          </Text>
          <TouchableOpacity style={styles.blockListButton} onPress={() => this.props.navigation.navigate('Blocklistnav')}>
            <Text style={styles.blockListButtonText}>Block List</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={this.state.userData}
          renderItem={this.renderContactItem}
          keyExtractor={(item) => item.user_id.toString()}
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
    alignItems: 'center',
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
  blockButton: {
    backgroundColor: 'white',
    borderColor: 'red',
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
  },
  blockButtonText: {
    color: 'red',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: 'red',
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 10,
  },
  removeSymbol: {
    width: '80%',
    height: 3,
    backgroundColor: 'white',
    position: 'absolute',
  },
  blockListButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  blockListButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
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
  headerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  headerInitialsContainer: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerInitials: {
    color: 'grey',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ContactsPage;
