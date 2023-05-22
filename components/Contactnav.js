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
      user_id: '',
      photo: null,
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


  handleBlockButton = (contact) => {
    const user_id = contact.user_id;
    this.blockContact(user_id).then(() => {
      this.props.getContacts();
    });
  };

  blockContact = async (user_id) => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/user/' + user_id + '/block',
    {
      method: 'POST',
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

  getProfileImage = async (user_id) => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/user/' + user_id + '/photo',
    {
      method: 'GET',
      headers: { 
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then(async (response) => {
      console.log(response);
      const rText = await response.text();
      console.log(rText);

      return res.blob();
    })
    .then((resBlob) => {
      let data = URL.createObjectURL(resBlob);

      this.setState({
          photo: data,
          isLoading: false
      })
    })
    .catch((error) => {
      console.error(error);
      this.setState({photo: null});
    });
  }

  render() {
    const { item, onPress } = this.props;

    const { first_name, last_name} = item;

    const navigation = this.props.navigation;

    const initials = first_name[0] + last_name[0];

    return (
      <TouchableHighlight underlayColor="#ddd" onPress={() => onPress(item)}>
        <View style={styles.contactItem}>
          <TouchableOpacity style={styles.removeButton} onPress={() => this.handleRemoveButton(item)}>
            <View style={styles.removeSymbol}/>
          </TouchableOpacity>
          {this.state.photo ?
              <Image style={styles.contactImage} source={{ uri: this.state.photo }}/> :
              <View style={styles.contactInitialsContainer}>
                <Text style={styles.contactInitials}>{initials.toUpperCase()}</Text>
              </View>
            }
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{first_name + " " +  last_name}</Text>
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
      user_id: '',
      selectedContacts: [],
      currentUserInfo: []
    };
  }

  handleContactPress = (contact) => {
    const user_id = contact.user_id;
  };

  renderContactItem = ({ item }) => (
    <ContactItem item={item} onPress={this.handleContactPress} getContacts={this.getContacts} />
  );

  async componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      const user_id = await AsyncStorage.getItem("whatsthat_user_id");
      this.checkLoggedIn();
      this.getContacts();
      this.getUserInfo(user_id);
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

  getUserInfo = async (user_id) => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/user/' + user_id,
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
      this.setState({ currentUserInfo: rJson });
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

    const { currentUserInfo, photo } = this.state;
    const { first_name, last_name } = currentUserInfo || {};

    const initials = (currentUserInfo.first_name && currentUserInfo.last_name)
      ? currentUserInfo.first_name[0] + currentUserInfo.last_name[0]
      : "";

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={this.handleProfilePress}>
            {photo ?
              <Image style={styles.headerImage} source={{ uri: photo }}/> :
              <View style={styles.headerInitialsContainer}>
                <Text style={styles.headerInitials}>{initials.toUpperCase()}</Text>
              </View>
            }
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hi {first_name}</Text>
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
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  contactInitialsContainer: {
    width: 40,
    height: 40,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInitialsContainer: {
    width: 40,
    height: 40,
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