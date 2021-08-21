import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import firebase from './firebase';


export default class CustomActions extends React.Component {

    onActionPress = () => {
        const options = [
            "Choose from library",
            "Take picture",
            "Send location",
            "Cancel",
        ];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        console.log("user wants to pick an image");
                        return this.selectImage();
                    case 1:
                        console.log("user wants to take a photo");
                        return this.takePhoto();
                    case 2:
                        console.log("user wants to get their location");
                        return this.getLocation();
                }
            }
        );
    };

    //Select Image from library
    selectImage = async () => {
        const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
        try {
            if (status === "granted") {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch((error) => console.log(error));
                if (!result.cancelled) {
                    const imageUrl = await this.uploadImageFetch(result.uri);
                    this.props.onSend({ image: imageUrl });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };


    takePhoto = async () => {
        const { status } = await Permissions.askAsync(
            Permissions.CAMERA,
            Permissions.MEDIA_LIBRARY
        );
        try {
            if (status === "granted") {
                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch((error) => console.log(error));

                if (!result.cancelled) {
                    const imageUrl = await this.uploadImageFetch(result.uri);
                    this.props.onSend({ image: imageUrl });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    //Get Location
    getLocation = async () => {
        try {
            const { status } = await Permissions.askAsync(Permissions.LOCATION_BACKGROUND);
            if (status === "granted") {
                const result = await Location.getCurrentPositionAsync(
                    {}
                ).catch((error) => console.log(error));
                const longitude = JSON.stringify(result.coords.longitude);
                const altitude = JSON.stringify(result.coords.latitude);
                if (result) {
                    this.props.onSend({
                        location: {
                            longitude: result.coords.longitude,
                            latitude: result.coords.latitude,
                        },
                    });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    //Upload image to firebase
    uploadImageFetch = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        const imageNameBefore = uri.split("/");
        const imageName = imageNameBefore[imageNameBefore.length - 1];

        const ref = firebase.storage().ref().child(`images/${imageName}`);

        const snapshot = await ref.put(blob);

        blob.close();

        return await snapshot.ref.getDownloadURL();
    };


    render() {
        return (
            <TouchableOpacity
                accessible={true}
                accessibilityLabel="More options"
                accessibilityHint="You can send a picture or your location."
                style={[styles.container]}
                onPress={this.onActionPress}
            >
                <View style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
};