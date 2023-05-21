import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Modal, ScrollView } from 'react-native';

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chat_id: '',
      user_id: '',
      chatData: '',
      messages: [],
      newMessage: '',
      messageId: '',
      loading: true,
      modalVisible: false,
      selectedMessageId: null,
      isEditing: false,
      editingMessageText: '',
      submitButtonText: 'Send',
      isEditingChatName: false,
      error: '',
      errorDetails: '',
    };
  }

  async componentDidMount() {
    const chat_id = await AsyncStorage.getItem("whatsthat_chat_id");
    const user_id = await AsyncStorage.getItem("whatsthat_user_id");
    this.setState({ user_id });
    this.setState({ chat_id }, () => {
      this.loadChatData();
      this.loadMessages();
    });

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.loadChatData();
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
        console.log(messages);
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

  sendMessages = async () => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + this.state.chat_id + '/message',
    {
        method: 'POST',
        headers: { 
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: this.state.newMessage,
        })
    })
    .then(async (response) => {
        if(response.status === 200) {
          this.setState({ newMessage: '' });
        }else if (response.status === 401) {
          console.log("Unauthorised")
        }else{
          this.setState({ error: 'An error has occured' });
        }
        await this.loadMessages();
    })
    .catch((error) => {
      console.error(error);
    });
  }

  deleteMessages = async (messageId) => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + this.state.chat_id + '/message/' + messageId, 
    {
      method: 'DELETE',
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
        "Content-Type": "application/json"
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          await this.loadMessages();
        } else if (response.status === 401) {
          console.log("Unauthorised")
        } else {
          this.setState({ error: 'An error has occurred' });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  updateMessage = async (messageId) => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + this.state.chat_id + '/message/' + this.state.editingMessageId,
    {
        method: 'PATCH',
        headers: { 
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: this.state.editingMessageText,
        })
    })
    .then(async (response) => {
        if(response.status === 200) {
          this.setState({
            isEditing: false,
            editingMessageText: '',
            submitButtonText: 'Send',
          });
          console.log("Message updated")
        }else if (response.status === 401) {
          console.log("Unauthorised")
        }else{
          this.setState({ error: 'An error has occured' });
          this.setState({errorDetails: `Status: ${response.status}, Status Text: ${response.statusText}`});
        }
        await this.loadMessages();
    })
    .catch((error) => {
      console.error(error);
    });
  };

  updateChatName = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + this.state.chat_id, {
        method: 'PATCH',
        headers: {
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: this.state.chatData.name,
        }),
      });
  
      if (response.status === 200) {
        console.log("Chat name updated");
        this.handleChatNameEdit();
      } else if (response.status === 401) {
        console.log("Unauthorized");
      } else {
        this.setState({ error: "An error has occurred" });
      }
    } catch (error) {
      console.error(error);
      this.setState({ error: "An error has occurred" });
    }
  };
  

  removeUser = async (user_id) => {
    return fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + this.state.chat_id + '/user/' + user_id,
    {
        method: 'DELETE',
        headers: { 
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
          "Content-Type": "application/json"
        },
    })
    .then(async (response) => {
        if(response.status === 200) {
          console.log("User removed.");

          const currentUserId = parseInt(await AsyncStorage.getItem("whatsthat_user_id"));
          const deletedUserId = parseInt(user_id)

          if(deletedUserId === currentUserId) {
            this.props.navigation.goBack();
          }
          else {
            console.log(user_id);
            console.log(currentUserId);
            await this.loadChatData();
          }
        }else if (response.status === 401) {
          console.log("Unauthorised")
        }else{
          this.setState({ error: 'An error has occured' });
          this.setState({errorDetails: `Status: ${response.status}, Status Text: ${response.statusText}`});
        }
        await this.loadMessages();
    })
    .catch((error) => {
      console.error(error);
    });
  };
  

  renderMessage = ({ item }) => {
    const { chatData } = this.state;
    const { user_id } = this.state;
  
    if (!chatData) {
      return null;
    }
  
    const messageStyle = item.author.user_id === parseInt(user_id)
      ? styles.sentMessage
      : styles.receivedMessage;
    const messageTextStyle = item.author.user_id === parseInt(user_id)
      ? styles.sentMessageText
      : styles.receivedMessageText;
    const authorName = item.author.user_id !== parseInt(user_id)
      ? (item.author.first_name + ' ' + item.author.last_name)
      : null;

    console.log(authorName);
  
    if (item.author.user_id === parseInt(user_id)) {
      return (
        <View>
          <TouchableOpacity style={messageStyle} onPress={(event) => this.showOptionsModal(item.message_id, event)}>
            <Text style={messageTextStyle}>{item.message}</Text>
            {this.renderOptionsModal(item.message_id, this.state.modalPosition?.x, this.state.modalPosition?.y, this.handleDeleteMessage)}
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View>
          {authorName && (
            <Text style={styles.authorName}>{authorName}</Text>
          )}
          <TouchableOpacity style={messageStyle}>
            <Text style={messageTextStyle}>{item.message}</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  showOptionsModal = (messageId, event) => {
    this.setState({
      modalVisible: true,
      selectedMessageId: messageId,
      modalPosition: { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY },
      messageId: messageId, 
    });
  };

  hideOptionsModal = () => {
    this.setState({ modalVisible: false, selectedMessageId: null });
  };

  handleEditMessage = () => {
    const { messages, selectedMessageId } = this.state;
    const messageToEdit = messages.find((message) => message.message_id === selectedMessageId);
  
    this.setState({
      isEditing: true,
      editingMessageId: selectedMessageId,
      editingMessageText: messageToEdit.message,
      submitButtonText: 'Revise',
    });
  
    this.hideOptionsModal();
  };

  handleDeleteMessage = (messageId) => {
    this.hideOptionsModal();
    this.deleteMessages(messageId);
  };

  handleChatNameEdit = () => {
    this.setState({ isEditingChatName: !this.state.isEditingChatName });
  };

  renderOptionsModal = (messageId, x, y) => {
    const { modalVisible, selectedMessageId } = this.state;
  
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible && selectedMessageId === messageId}
        onRequestClose={this.hideOptionsModal}
      >
        <TouchableOpacity onPress={this.hideOptionsModal}>
          <View style={styles.modalOverlay}></View>
        </TouchableOpacity>
        <View style={[styles.modalContainer, { left: x - 130, top: y }]}>
          <TouchableOpacity style={styles.modalOption} onPress={this.handleEditMessage}>
            <Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => this.handleDeleteMessage(messageId)}>
            <Text>Delete</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  render() {
    const { chatData, messages, loading, error } = this.state;
    if (loading) {
      return <Text>Loading...</Text>;
    }

    if (error) {
      return (
        <View>
          <Text>{error}</Text>
          <Text>{this.state.errorDetails}</Text>
        </View>
      );
    }

    const { name, creator, members } = chatData;

    return (
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.header}>
          {this.state.isEditingChatName ? (
            <TextInput
              style={styles.headerTitle}
              value={name}
              onChangeText={(text) => this.setState({ chatData: { ...chatData, name: text } })}
              onSubmitEditing={this.updateChatName}
            />
          ) : (
            <Text style={styles.headerTitle} onPress={this.handleChatNameEdit}>
              {name}
            </Text>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => this.props.navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.membersContainer}>
          <FlatList
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            data={members}
            renderItem={({ item }) => (
              <View style={styles.memberContainer}>
              <View style={styles.memberNameContainer}>
                <Text style={styles.memberName}>{item.first_name} {item.last_name}</Text>
              </View>
              <TouchableOpacity style={styles.memberButton} onPress={() => this.removeUser(item.user_id) && console.log('PRessed')}>
                <Text style={styles.memberButtonText}>X </Text>
              </TouchableOpacity>
            </View>
            )}
            keyExtractor={(item) => item.user_id.toString()}
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </View>
        <FlatList
          data={messages}
          renderItem={this.renderMessage}
          keyExtractor={(item) => item.message_id.toString()}
          inverted={true}
        />
        <View style={styles.bottomContainer}>
          <TextInput
            style={styles.sendMessageInput}
            placeholder="Enter message"
            onChangeText={(text) => this.setState(this.state.isEditing ? { editingMessageText: text } : { newMessage: text })}
            value={this.state.isEditing ? this.state.editingMessageText : this.state.newMessage}
          />
          <TouchableOpacity
            style={styles.sendMessageButton}
            onPress={() => (this.state.isEditing ? this.updateMessage(this.state.editingMessageId) : this.sendMessages())}
          >
            <Text style={styles.sendMessageButtonText}>{this.state.submitButtonText}</Text>
          </TouchableOpacity>
          {this.renderOptionsModal()}
        </View>
      </KeyboardAvoidingView>
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
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    marginTop: 5,
    maxWidth: '80%',
  },
  sentMessageText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'left',
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
  sendMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sendMessageInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendMessageButton: {
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  sendMessageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  modalContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    paddingVertical: 5,
    paddingHorizontal: 5,
    width: 120,
    left: 0,
    right: 0,
    bottom: 0,
    alignSelf: 'flex-end',
    maxHeight: 80,
  },
  modalOption: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 80,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  authorName: {
    marginHorizontal: 10,
    marginTop: 10,
    fontSize: 12,
    color: '#aaa',
  },
  membersContainer: {
    paddingVertical: 5,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  memberNameContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  memberName: {
    fontWeight: 'bold',
  },
  memberButton: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  memberButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;