import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { StyleSheet, FlatList, View, Text } from 'react-native';

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chat_id: '',
      chatData: '',
      messages: [],
      loading: true,
      error: '',
    };
  }

  async componentDidMount() {
    const chat_id = await AsyncStorage.getItem("whatsthat_chat_id");
    this.setState({ chat_id }, () => {
      this.loadChatData();
      this.loadMessages();
    });

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.loadMessages();
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

  loadChatData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + this.state.chat_id, {
        method: 'GET',
        headers: {
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
        },
      });

      if (response.status === 200) {
        const chatData = await response.json();
        this.setState({ chatData, loading: false });
      } else if (response.status === 401) {
        this.setState({ error: 'Unauthorized', loading: false });
      } else {
        this.setState({ error: 'An error occurred', loading: false });
      }
    } catch (error) {
      console.error(error);
      this.setState({ error: 'An error occurred', loading: false });
    }
  }

  loadMessages = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + this.state.chat_id, {
        method: 'GET',
        headers: {
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
        },
      });

      if (response.status === 200) {
        const { messages } = await response.json();
        this.setState({ messages });
      } else if (response.status === 401) {
        console.log("Unauthorised");
      } else {
        this.setState({ error: 'An error occurred' });
        console.log("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      console.log("Something went wrong.");
    }
  }

  renderMessage = ({ item }) => {
    const { chatData } = this.state;
    if (!chatData) {
      return null;
    }

    const messageStyle = item.author.user_id === chatData.creator.user_id
      ? styles.sentMessage
      : styles.receivedMessage;
    const messageTextStyle = item.author.user_id === chatData.creator.user_id
      ? styles.sentMessageText
      : styles.receivedMessageText;

    return (
      <View>
        <View style={messageStyle}>
          <Text style={messageTextStyle}>Kitti Smells good</Text>
          <Text style={messageTextStyle}>{item.message}</Text>
        </View>
      </View>
    );
  };

  render() {
    const { chatData, messages, loading, error } = this.state;
    if (loading) {
      return <Text>Loading...</Text>;
    }

    if (error) {
      return <Text>{error}</Text>;
    }

    const { name, creator, members } = chatData;

    return (
      <View style={styles.container}>
        <View>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{name}</Text>
          </View>
          <Text>Created by {creator.first_name} {creator.last_name}</Text>
          <Text>Members:</Text>
          <FlatList
            data={members}
            renderItem={({ item }) => (
              <Text>{item.first_name} {item.last_name}</Text>
            )}
            keyExtractor={(item) => item.user_id.toString()}
          />
          <Text>Messages:</Text>
          <FlatList
            data={messages}
            renderItem={this.renderMessage}
            keyExtractor={(item) => item.message_id.toString()}
          />
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
  sentMessage: {
    backgroundColor: '#DCF8C5',
    alignSelf: 'flex-end',
    borderRadius: 20,
    padding: 10,
    margin: 10,
    maxWidth: '80%',
  },
  receivedMessage: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderRadius: 20,
    padding: 10,
    margin: 10,
    maxWidth: '80%',
  },
  sentMessageText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'right',
  },
  receivedMessageText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'left',
  },
  messageTime: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'right',
  },
});

export default ChatScreen;