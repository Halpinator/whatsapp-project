import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableHighlight } from 'react-native';

const CONTACTS = [
  {
    id: 1,
    name: 'John Doe',
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
    messages: [
      { id: 1, content: 'Hello there!', time: '10:00 AM' },
      { id: 2, content: 'How are you?', time: '10:05 AM' },
      { id: 3, content: 'See you soon!', time: '11:00 AM' },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
    messages: [
      { id: 1, content: 'Hey, what\'s up?', time: '9:00 AM' },
      { id: 2, content: 'Want to grab lunch?', time: '12:00 PM' },
    ],
  },
];

class ContactItem extends Component {
  constructor(props){
    super(props);
    this.state ={ 
      isLoading: true,
      contactListData: []
    }
  }


  render() {
    const { item, onPress } = this.props;
    const { name, profilePic, messages } = item;
    const lastMessage = messages[messages.length - 1];

    return (
      <TouchableHighlight underlayColor="#ddd" onPress={() => onPress(item)}>
        <View style={styles.contactItem}>
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{name}</Text>
            <Text style={styles.lastMessage}>{lastMessage.content}</Text>
          </View>
          <Text style={styles.messageTime}>{lastMessage.time}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

class ContactsPage extends Component {
  handleContactPress = (contact) => {
    // Handle contact press
  };

  renderContactItem = ({ item }) => (
    <ContactItem item={item} onPress={this.handleContactPress} />
  );

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={CONTACTS}
          renderItem={this.renderContactItem}
          keyExtractor={(item) => item.id.toString()}
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
});

export default ContactsPage;