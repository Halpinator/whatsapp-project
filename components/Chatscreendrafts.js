import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { res } from 'react-email-validator';
import { StyleSheet, Text, View, FlatList, Image, TouchableHighlight, TouchableOpacity, TextInput, Button, ScrollView } from 'react-native';

class DraftItem extends Component {
  constructor(props){
    super(props);
    this.state = { 
      text: this.props.text,
      isEditing: false,
    }
  }

  handleSendButton = () => {
    this.props.onSend(this.props.id);
  };

  handleEditButton = () => {
    this.setState({isEditing: true});
  };

  handleChangeText = (text) => {
    this.setState({text});
  };

  handleDoneButton = () => {
    this.setState({isEditing: false});
    this.props.onEdit(this.props.id, this.state.text);
  };

  render() {
    if (this.state.isEditing) {
      return (
        <View style={styles.draftItem}>
          <TextInput style={styles.draftInput} value={this.state.text} onChangeText={this.handleChangeText} />
          <TouchableOpacity
            style={styles.editAndSendButton}
            onPress={this.handleDoneButton}
          >
            <Text style={styles.editAndSendButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.draftItem}>
          <Text style={styles.draftText}>{this.state.text}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editAndSendButton}
              onPress={this.handleEditButton}
            >
              <Text style={styles.editAndSendButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editAndSendButton}
              onPress={this.handleSendButton}
            >
              <Text style={styles.editAndSendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}

class ChatScreenContacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drafts: [],
      text: '',
      chat_id: '',
      user_id: '',
    };
  }

  sendMessages = async (message) => {
    console.log(message);

    return fetch('http://127.0.0.1:3333/api/1.0.0/chat/' + this.state.chat_id + '/message',
    {
        method: 'POST',
        headers: { 
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message.text,
        })
    })
    .then(async (response) => {
        if(response.status === 200) {
          console.log("Success")
        }else if (response.status === 401) {
          console.log("Unauthorised")
        }else{
          this.setState({ error: 'An error has occured' });
        }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login')
    }
  }

  handleAddButton = () => {
    const newDraft = {
      id: new Date().getTime().toString(),
      text: this.state.text,
    };

    this.setState((prevState) => ({
      drafts: [...prevState.drafts, newDraft],
      text: '',
    }), () => {
      AsyncStorage.setItem('drafts', JSON.stringify(this.state.drafts));
    });
  };

  handleSendButton = async (id) => {
    const draft = this.state.drafts.find((draft) => draft.id === id);

    // Send draft.text to the chat
    this.sendMessages(draft);

    // Then remove the draft from the state and async storage
    this.setState((prevState) => ({
      drafts: prevState.drafts.filter((draft) => draft.id !== id),
    }), () => {
      AsyncStorage.setItem('drafts', JSON.stringify(this.state.drafts));
    });
  };

  handleEditButton = (id, text) => {
    this.setState((prevState) => ({
      drafts: prevState.drafts.map((draft) => draft.id === id ? {...draft, text} : draft),
    }), () => {
      AsyncStorage.setItem('drafts', JSON.stringify(this.state.drafts));
    });
  };

  handleChangeText = (text) => {
    this.setState({text});
  };

  async componentDidMount(){
    const drafts = await AsyncStorage.getItem('drafts');

    if (drafts) {
      this.setState({ drafts: JSON.parse(drafts) });
    }

    const chat_id = await AsyncStorage.getItem("whatsthat_chat_id");
    const user_id = await AsyncStorage.getItem("whatsthat_user_id");
    this.setState({ chat_id });
  
    this.checkLoggedIn();

    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      this.checkLoggedIn();
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My drafts</Text>
        </View>
        <ScrollView style={styles.drafts}>
          {this.state.drafts.map((draft) => (
            <DraftItem 
              key={draft.id} 
              id={draft.id} 
              text={draft.text} 
              onSend={this.handleSendButton} 
              onEdit={this.handleEditButton}
            />
          ))}
        </ScrollView>
        <View style={styles.bottomContainer}>
          <TextInput style={styles.draftInput} value={this.state.text} onChangeText={this.handleChangeText} />
          <TouchableOpacity
            style={styles.sendMessageButton}
            onPress={this.handleAddButton}
          >
            <Text style={styles.sendMessageButtonText}>Add</Text>
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
  draftItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  drafts: {
    flex: 1,
  },
  addDraft: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sendMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  draftInput: {
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
  editAndSendButton: {
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    margin: 5,
  },
  editAndSendButtonText: {
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
  draftText: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
});

export default ChatScreenContacts;