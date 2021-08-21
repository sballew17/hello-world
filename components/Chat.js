import React from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';
import firebase from './firebase';
import 'firebase/firestore';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Setting a timer']);



export default class Chat extends React.Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            uid: 0,
            user: {
                _id: '',
                name: ''
            },
            isConnected: false,
            image: null,
            location: null,
        }
        this.referenceChatMessages = firebase.firestore().collection('messages');
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
    async addMessages() {
        const message = this.state.messages[0];
        this.referenceChatMessages.add({
            _id: message._id,
            createdAt: message.createdAt,
            image: message.image || null,
            location: message.location || null,
            text: message.text || null,
            user: message.user,

        })
    }

    // Save Messages to local storage
    async saveMessages() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (error) {
            console.log(error.message);
        }
    }

    componentDidMount() {
        const { name } = this.props.route.params;
        this.props.navigation.setOptions({ title: `${name}` });

        // Check if user is online or offline
        NetInfo.fetch().then((connection) => {
            if (connection.isConnected) {
                this.setState({
                    isConnected: true,
                });
                // onSnapshot function listens for collection updates
                this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
                this.authUnsubscribe = firebase
                    .auth()
                    .onAuthStateChanged(async (user) => {
                        if (!user) {
                            console.log("user before", user)
                            let aUser = await firebase.auth().signInAnonymously();
                            user = {
                                uid: aUser.uid,
                            }
                        }
                        console.log("user after login", user)
                        this.setState((prevState) => ({
                            ...prevState,
                            uid: user.uid,
                            user: {
                                _id: user.uid,
                                name: this.props.route.params.name,

                            },
                            image: this.state.image,
                            location: {
                                longitude: 11.5249684,
                                latitude: 48.0643933,
                            },
                        }))
                    });
            } else {
                this.setState({
                    isConnected: false,
                });
                this.getMessages();
            }
        })
    }

    componentWillUnmount() {
        this.authUnsubscribe();
        this.referenceChatMessages = () => { }
    }


    // Retrieve current messages and store them in the state: messages
    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        // console.log(querySnapshot)
        // go through each document
        querySnapshot.forEach((doc) => {
            //   // get the QueryDocumentSnapshot's data
            let data = doc.data();
            messages.push({
                _id: data._id,
                createdAt: data.createdAt.toDate(),
                image: data.image || null,
                location: data.location || null,
                text: data.text,
                user: data.user,
            });
        });
        this.setState({
            messages,
        })
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
    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#7777',
                        color: '#FFF'
                    },
                    left: {
                        backgroundColor: '#FFF',
                    }
                }} />
        );
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


    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    };
    renderCustomView(props) {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    }

    render() {
        let text = this.props.route.params.text;
        let backColor = this.props.route.params.backColor;

        this.props.navigation.setOptions({ title: text });

        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: backColor }}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    renderActions={this.renderCustomActions}
                    renderCustomView={this.renderCustomView}
                    isConnected={this.state.isConnected}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={this.state.user}
                />
                {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
                }
            </View>
        )
    }
}

