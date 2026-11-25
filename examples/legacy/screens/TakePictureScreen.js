import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import Spinner from 'react-native-loading-spinner-overlay';

export const WHOLE = 'whole';
export const NUTRITION = 'nutrition';
export const INGREDIENTS = 'ingredients';

export function getPicturePath(name) {
    return `${name}PicturePath`;
}

export default class TakePictureScreen extends React.Component {
    state = {
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
        picturePath: null,
        spinner: false,
        flash: Camera.Constants.FlashMode.off
    };

    static navigationOptions = {
        title: 'Prendre une photo'
    };

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    _getPictureName() {
        return this.props.navigation.getParam('name');
    }

    _renderViewPicture() {
        return (
            <View style={{ flex: 1 }}>
                <Image style={{ flex: 1 }} source={{ uri: this.state.picturePath }} />
                <TouchableOpacity
                    style={styles.dismisscontainer}
                    onPress={() => {
                        this.setState({ picturePath: null });
                    }}
                >
                    <Image style={{ width: 30, height: 30 }} source={require('../assets/images/error.png')} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.validatecontainer}
                    onPress={() => {
                        const picturePath = getPicturePath(this._getPictureName());
                        const args = {};
                        args[picturePath] = this.state.picturePath;
                        this.props.navigation.navigate('Add', args);
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 18 }}>Valider cette photo</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        const { hasCameraPermission } = this.state;

        if (hasCameraPermission === null) {
            return <View />;
        }
        if (hasCameraPermission === false) {
            return <Text>Accés à la caméra non autorisé</Text>;
        }
        if (this.state.picturePath) {
            return this._renderViewPicture();
        }

        const flash =
            this.state.flash === Camera.Constants.FlashMode.off
                ? require('../assets/images/flash.png')
                : require('../assets/images/flash-on.png');

        return (
            <View style={{ flex: 1 }}>
                <Spinner
                    visible={this.state.spinner}
                    textContent={'Traitement de la photo... veuillez patienter'}
                    textStyle={styles.spinnerTextStyle}
                />

                <Camera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={{ flex: 1 }}
                    type={this.state.type}
                    flashMode={this.state.flash}
                >
                    <View style={styles.cameraview}>
                        <TouchableOpacity
                            style={styles.capturecontainer}
                            onPress={() => {
                                this.camera
                                    .takePictureAsync({ skipProcessing: true })
                                    .then(data => {
                                        this.setState({ spinner: !this.state.spinner });
                                        return ImageManipulator.manipulateAsync(
                                            data.uri,
                                            [{ resize: { width: 1000, height: 1280 } }],
                                            { compress: 0.6, format: ImageManipulator.SaveFormat.JPG }
                                        );
                                    })
                                    .then(data => {
                                        this.setState({ picturePath: data.uri, spinner: !this.state.spinner });
                                    })
                                    .catch(error => {
                                        console.log('Error taking picture:', error);
                                    });
                            }}
                        >
                            <Image style={{ width: 60, height: 60 }} source={require('../assets/images/camera.png')} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.flashcontainer}
                            onPress={() => {
                                this.setState({
                                    flash:
                                        this.state.flash === Camera.Constants.FlashMode.off
                                            ? Camera.Constants.FlashMode.on
                                            : Camera.Constants.FlashMode.off
                                });
                            }}
                        >
                            <Image style={{ width: 30, height: 30 }} source={flash} />
                        </TouchableOpacity>
                    </View>
                </Camera>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    cameraview: {
        flex: 1,
        backgroundColor: 'transparent'
    },

    spinnerTextStyle: {
        color: '#FFF',
        textAlign: 'center'
    },

    flashcontainer: {
        position: 'absolute',
        top: 10,
        left: 10
    },

    capturecontainer: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center'
    },

    textstyle: {
        fontSize: 18,
        marginBottom: 10,
        color: 'white'
    },

    dismisscontainer: {
        position: 'absolute',
        top: 20,
        left: 20
    },

    validatecontainer: {
        position: 'absolute',
        backgroundColor: '#38b3c5',
        borderRadius: 7,
        bottom: 20,
        alignSelf: 'center',
        width: 180,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
