import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableHighlight, TouchableOpacity, TextInput,
} from 'react-native';

class ChatItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
    };
  }

  async componentDidMount() {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');
    this.setState({ userId: parseInt(userId) });
  }

  render() {
    const { item, onPress } = this.props;
    const { name, last_message } = item;
    const { userId } = this.state;

    let lastMessageComponent;
    if (last_message && last_message.author) {
      lastMessageComponent = userId === last_message.author.user_id
        ? `You: ${last_message.message}`
        : `${last_message.author.first_name}: ${last_message.message}`;
    } else {
      lastMessageComponent = 'No message';
    }

    return (
      <TouchableHighlight underlayColor="#ddd" onPress={() => onPress(item)}>
        <View style={styles.ChatItem}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{name}</Text>
            <Text style={styles.lastMessage}>{lastMessageComponent}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

class ChatNavPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatData: [],
      chat_id: '',
      newChatName: '',
    };
  }

  async componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getChats();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleChatPress = (chat) => {
    AsyncStorage.setItem('whatsthat_chat_id', chat.chat_id);
    this.props.navigation.navigate('Chattab');
  };

  renderChatItem = ({ item }) => <ChatItem item={item} onPress={this.handleChatPress} />;

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  getChats = async () => fetch('http://127.0.0.1:3333/api/1.0.0/chat', {
    method: 'GET',
    headers: {
      'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
    },
  })
    .then(async (response) => {
      if (response.status === 200) {
        console.log('Successfully got chats');
        const rJson = await response.json();
        this.setState({ chatData: rJson });
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

  createChat = async () => fetch('http://127.0.0.1:3333/api/1.0.0/chat', {
    method: 'POST',
    headers: {
      'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: this.state.newChatName,
    }),
  })
    .then(async (response) => {
      if (response.status === 201) {
        console.log('Successfully created a new chat');
        this.setState({ newChatName: '' });
      } else if (response.status === 400) {
        console.log('Bad request');
      } else if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 500) {
        console.log('Server Error');
      } else {
        console.log('Something went wrong');
      }
      await this.getChats();
    })
    .catch((error) => {
      console.error(error);
    });

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Chats</Text>
        </View>
        <FlatList
          data={this.state.chatData}
          renderItem={this.renderChatItem}
          keyExtractor={(item) => item.chat_id.toString()}
          style={styles.contactList}
        />
        <View style={styles.createChatContainer}>
          <TextInput
            style={styles.createChatInput}
            placeholder="Enter chat name"
            onChangeText={(text) => this.setState({ newChatName: text })}
            value={this.state.newChatName}
          />
          <TouchableOpacity
            style={styles.createChatButton}
            onPress={() => {
              if (this.state.newChatName.trim() !== '') {
                this.createChat();
              }
            }}
          >
            <Text style={styles.createChatButtonText}>Create Chat</Text>
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
  ChatItem: {
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
  createChatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  createChatInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  createChatButton: {
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  createChatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatNavPage;
