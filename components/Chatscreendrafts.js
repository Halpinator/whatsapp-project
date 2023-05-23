import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { res } from 'react-email-validator';
import { StyleSheet, Text, View, FlatList, Image, TouchableHighlight, TouchableOpacity, TextInput, Button, ScrollView } from 'react-native';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

class DraftItem extends Component {
  constructor(props){
    super(props);
    this.state = { 
      text: this.props.text,
      isEditing: false,
      isScheduling: false,
      date: new Date(),
      hasBeenScheduled: false,
    }
  }

  handleSendButton = () => this.props.onSend(this.props.id);
  handleEditButton = () => this.setState({isEditing: true});
  handleScheduleButton = () => this.setState({isScheduling: true});
  handleDeleteButton = () => this.props.onDelete(this.props.id);

  handleDateChange = (selectedDate) => {
    const currentDate = selectedDate || this.state.date;
    
    const timeUntilSend = currentDate.getTime() - Date.now();
  
    if (timeUntilSend > 0) {
      this.setState({date: currentDate, isScheduling: false, hasBeenScheduled: true});
  
      setTimeout(() => {
        this.handleSendButton();
      }, timeUntilSend);
    } else {
      console.error('Selected time is in the past');
      this.setState({hasBeenScheduled: false});
    }
  };
  
  handleChangeText = (text) => this.setState({text});

  handleDoneButton = () => {
    this.setState({isEditing: false});
    this.props.onEdit(this.props.id, this.state.text);
  };

  render() {
    if (this.state.isScheduling) {
      return (
        <DatePicker
          selected={this.state.date}
          onChange={this.handleDateChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="Pp"
        />
      );
    } else if (this.state.isEditing) {
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
          {this.state.hasBeenScheduled && (
              <Text style={styles.dateText}>
                Scheduled for: {this.state.date.toLocaleString()}
              </Text>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={this.handleScheduleButton}
            >
              <Text style={styles.actionButtonText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={this.handleEditButton}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={this.handleDeleteButton}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={this.handleSendButton}
            >
              <Text style={styles.actionButtonText}>Send</Text>
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
        if (response.status === 200) {
          console.log("Successfully sent message")
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
          console.log('Something went wrong');
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
    if (this.state.text.trim() === '') {
      return; 
    }

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

    this.sendMessages(draft);

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

  handleDeleteButton = (id) => {
    this.setState((prevState) => ({
      drafts: prevState.drafts.filter((draft) => draft.id !== id),
    }), () => {
      AsyncStorage.setItem('drafts', JSON.stringify(this.state.drafts));
    });
  };

  handleChangeText = (text) => this.setState({text});

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
              onDelete={this.handleDeleteButton}
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
  dateText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'right',
  },
  deleteButton: {
    height: 50,
    backgroundColor: '#ff0000',  // you can adjust the color as you prefer
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    margin: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  draftItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'space-between',
  },
  draftText: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: 'red',
    borderRadius: 5,
  },
});

export default ChatScreenContacts;