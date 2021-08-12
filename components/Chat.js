import React from 'react';
import { View, Text, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
const firebase = require('firebase');
require('firebase/firestore');
// import firebase from 'firebase';
// import 'firebase/firestore';



export default class Chat extends React.Component {
    constructor() {
        super();


        const firebaseConfig = {
            apiKey: "AIzaSyDw-qJvzgcPfY-B_2ggxEi8noIFkyQqHRw",
            authDomain: "hello-world-aa406.firebaseapp.com",
            projectId: "hello-world-aa406",
            storageBucket: "hello-world-aa406.appspot.com",
            messagingSenderId: "1094062716223",
            appId: "1:1094062716223:web:af54ed16328a0d6af10f8a",
            measurementId: "G-2J77HRY0SR",
        }
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        this.referenceChatMessages = firebase.firestore().collection('messages');
        this.referenceMessageUser = null;

        this.state = {
            messages: [],
            uid: 0,
            user: {
                _id: '',
                name: '',
            },
            isConnected: false,
            image: null,
            location: null,
        };
    }

    componentDidMount() {
        const { name } = this.props.route.params;
        this.props.navigation.setOptions({ title: `${name}` });

        // Check if user is online or offline
        NetInfo.fetch().then(connection => {
            if (connection.isConnected) {
                this.setState({ isConnected: true });
                console.log('online');

                // listen to authentication events
                this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
                    if (!user) {
                        firebase.auth().signInAnonymously();
                    }

                    // Update user state with active user
                    this.setState({
                        uid: user.uid,
                        messages: [],
                        user: {
                            _id: user.uid,
                            name: name,
                        }
                    });
                    // Create reference to the active users messages
                    this.referenceMessagesUser = firebase.firestore().collection('messages').where('uid', '==', this.state.uid);
                    // Listen for collection changes
                    this.unsubscribe = this.referenceChatMessages.orderBy("createdAt", "desc").onSnapshot(this.onCollectionUpdate);
                });
            } else {
                console.log('offline');
                this.setState({ isConnected: false })
                // Calls messeages from offline storage
                this.getMessages();
            }
        });
    }

    componentWillUnmount() {
        this.authUnsubscribe();
        this.authUnsubscribe();
    }

    //Loads messages from AsyncStorage
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    //Delete messages from AsyncStorage
    async deleteMessages() {
        try {
            await AsyncStorage.removeItem('messages');
            this.setState({
                messages: []
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    // Add messages to database
    addMessages() {
        const message = this.state.messages[0];
        // add a new messages to the collection
        this.referenceChatMessages.add({
            uid: this.state.uid,
            _id: message._id,
            createdAt: message.createdAt,
            text: message.text || null,
            user: message.user,
            image: message.image || null,
            location: message.location || null,
        });
    }

    // Save Messages to local storage
    async saveMessages() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (error) {
            console.log(error.message);
        }
    }

    // Funciton to send messages
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }),
            // Make sure to call addMessages so they get saved to the server
            () => {
                this.addMessages();
                // Calls function saves to local storage
                this.saveMessages();
            })
    }

    // Retrieve current messages and store them in the state: messages
    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            let data = doc.data();
            messages.push({
                _id: data._id,
                createdAt: data.createdAt.toDate(),
                text: data.text || '',
                user: {
                    _id: data.user._id,
                    name: data.user.name,
                },
                image: data.image || null,
                location: data.location || null,
            });
        });
        this.setState({
            messages,
        });
    }

    // Sets System Message color
    renderSystemMessage(props) {
        let backgroundColor = this.props.route.params.backgroundColor;
        if (backgroundColor !== '#FFFFFF') {
            return (
                <SystemMessage
                    {...props}
                    textStyle={{ color: '#FFFFFF' }}
                    timeTextStyle={{ color: '#FFFFFF' }}
                />
            );
        }
    }

    //If offline, dont render the input toolbar
    renderInputToolbar(props) {
        if (this.state.isConnected === false) {
        } else {
            return (
                <InputToolbar
                    {...props}
                />
            );
        }
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#000'
                    }
                }}
            />
        )
    }

    render() {
        let text = this.props.route.params.text;
        let backColor = this.props.route.params.backColor;

        this.props.navigation.setOptions({ title: text });

        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: backColor }}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                />
                {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
                }
            </View>
        )
    }
}