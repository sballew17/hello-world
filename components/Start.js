import React from 'react';
import { View, Text, Button, TextInput, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';

export default class Start extends React.Component {
    constructor(props) {
        super(props);
        this.state = { text: '', backColor: '#757083' };
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>


                <ImageBackground source={image} resizeMode="cover" style={styles.image}>
                    <Text style={styles.text}>Hello There!</Text>
                    <Text style={styles.text2}>Choose A Background Color</Text>
                    <View style={styles.backColor}>
                        <TouchableOpacity
                            style={styles.colorSelection1}
                            onPress={() => this.setState({ backColor: '#090C08' })}

                        />
                        <TouchableOpacity
                            style={styles.colorSelection2}
                            onPress={() => this.setState({ backColor: '#474056' })}
                        />
                        <TouchableOpacity
                            style={styles.colorSelection3}
                            onPress={() => this.setState({ backColor: '#8A95A5' })}
                        />
                        <TouchableOpacity
                            style={styles.colorSelection4}
                            onPress={() => this.setState({ backColor: '#B9C6AE' })}
                        />
                    </View>


                </ImageBackground>
                <TextInput
                    style={styles.textinput}
                    onChangeText={(text) => this.setState({ text })}
                    value={this.state.text}
                    placeholder='Type here ...'
                />

                <TouchableOpacity
                    accessible={true}
                    accessibilityLabel="More options"
                    accessibilityHint="Lets you choose to send an image or your geolocation."
                    accessibilityRole="button"
                    onPress={this._onPress}>
                    <Button

                        title="Enter Chat Room"
                        style={styles.button, { backgroundColor: this.state.backColor }}
                        onPress={() => this.props.navigation.navigate('Chat', { text: this.state.text, backColor: this.state.backColor })}
                    />
                </TouchableOpacity>
            </View>



        )
    }
}

const image = { uri: "https://reactjs.org/logo-og.png" };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center"
    },
    image: {
        flex: 1,
        justifyContent: "center"
    },
    text: {
        color: "white",
        fontSize: 42,
        lineHeight: 84,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "#000000c0"
    },
    text2: {
        color: "white",
        fontSize: 30,
        lineHeight: 40,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "#000000c0"
    },
    textinput: {
        backgroundColor: 'white',
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 3,
        padding: 5,
    },
    backColor: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    colorSelection1: {
        backgroundColor: '#090C08',
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    colorSelection2: {
        backgroundColor: '#474056',
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    colorSelection3: {
        backgroundColor: '#8A95A5',
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    button: {
        height: 60,
        color: '#fff',
        fontSize: 16,
        fontWeight: '300',
    },

    colorSelection4: {
        backgroundColor: '#B9C6AE',
        width: 50,
        height: 50,
        borderRadius: 25,
    },
})
