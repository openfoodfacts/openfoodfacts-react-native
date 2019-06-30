import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    ScrollView,
    KeyboardAvoidingView
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import { Icon } from 'react-native-elements';
import { getProduct, uploadProductToOFF } from '../API/Api';
import { getPicturePath, INGREDIENTS, NUTRITION, WHOLE } from './TakePictureScreen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export const FOOD = 'Food';

export default class AddProductScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        title: `Editer ou ajouter un produit dans Open ${navigation.state.params.category} Facts`,
        headerStyle: {
            backgroundColor: '#38b3c5'
        },
        headerTintColor: 'white'
    });

    constructor(props) {
        super(props);
        this.state = {
            activeSections: [],
            textBrand: '',
            textName: '',
            textLabel: '',
            textCategory: '',
            alreadyExist: false,
            existingName: '',
            existingBrand: '',
            existingLabels: '',
            existingCategories: '',
            status: 'Ajouter ce produit'
        };
    }

    async componentDidMount() {
        this.props.navigation.addListener('didFocus', () => {
            // close section when getting back to this screen because section is not refreshed correctly when adding an image
            this.setState({ activeSections: [] });
        });

        const offProduct = await getProduct(this.getEan());
        if (offProduct !== null) {
            Alert.alert(
                'Edition',
                `Le produit existait déjà dans Open Food Facts. Vous pouvez éditer les infos et ajouter de nouvelles photos.`
            );
            const product = offProduct.product;
            this.setState({
                existingName: product.product_name,
                textName: product.product_name,
                existingLabels: product.labels,
                existingCategories: product.categories,
                existingBrand: product.brands,
                alreadyExist: true
            });
        }
    }

    _renderHeader = (section, index, isActive) => {
        return (
            <View style={styles.header}>
                <Icon name={section.icon} />
                <Text style={styles.headerText}>{section.title}</Text>
                <View style={{ flex: 100, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Icon name={isActive ? 'chevron-left' : 'chevron-right'} />
                </View>
            </View>
        );
    };

    _renderBrands() {
        if (this.state.existingBrand) {
            return (
                <Text style={[styles.textHeader, { marginTop: 5 }]}>
                    Les marques existantes sont : "{this.state.existingBrand}". Ajouter une autre marque :
                </Text>
            );
        }
        return <Text style={[styles.textHeader, { marginTop: 5 }]}>*Nom des marques :</Text>;
    }

    _renderName() {
        if (this.state.existingName) {
            return <Text style={styles.textHeader}>Renommer le produit :</Text>;
        }
        return <Text style={styles.textHeader}>*Nom du produit :</Text>;
    }

    _renderLabels() {
        if (this.state.existingLabels) {
            return (
                <Text style={styles.textHeader}>
                    Les labels existants sont : "{this.state.existingLabels}". Ajouter d'autres labels (séparés par des
                    virgules) :
                </Text>
            );
        }
        return (
            <Text style={[styles.textHeader, { marginTop: 5 }]}>Labels du produit (séparés par des virgules) :</Text>
        );
    }

    _renderCategories() {
        if (this.state.existingCategories) {
            return (
                <Text style={styles.textHeader}>
                    Les catégories existantes sont : "{this.state.existingCategories}". Ajouter d'autres catégories
                    (séparées par des virgules) :
                </Text>
            );
        }
        return (
            <Text style={[styles.textHeader, { marginTop: 5 }]}>
                Catégories du produit (séparées par des virgules) :
            </Text>
        );
    }

    _renderDescription() {
        const exampleCategory = this.props.navigation.getParam('category') === FOOD ? 'Plat cuisiné' : 'Corps';
        return (
            <View>
                {this._renderBrands()}
                <TextInput
                    placeholder="Par exemple : Jardin Bio, Léa Nature"
                    style={styles.textinputstyle}
                    onChangeText={textBrand => this.setState({ textBrand })}
                    value={this.state.textBrand}
                />
                {this._renderName()}
                <TextInput
                    placeholder="Par exemple : Haricots verts"
                    style={styles.textinputstyle}
                    onChangeText={textName => this.setState({ textName })}
                    value={this.state.textName}
                />
                {this._renderLabels()}
                <TextInput
                    placeholder="Par exemple : Bio"
                    style={styles.textinputstyle}
                    onChangeText={textLabel => this.setState({ textLabel })}
                    value={this.state.textLabel}
                />
                {this._renderCategories()}
                <TextInput
                    placeholder={`Par exemple : ${exampleCategory}`}
                    style={styles.textinputstyle}
                    onChangeText={textCategory => this.setState({ textCategory })}
                    value={this.state.textCategory}
                />
            </View>
        );
    }

    getCategory() {
        return this.props.navigation.getParam('category');
    }

    getEan() {
        return this.props.navigation.getParam('ean');
    }

    getPicturePathParam(name) {
        return this.props.navigation.getParam(getPicturePath(name));
    }

    _renderPictureSection(name) {
        return (
            <View>
                <Text style={{ margin: 5 }}>
                    Appuyez sur la caméra pour prendre une photo, votre capture s'affichera ensuite à sa droite !
                </Text>
                <View style={styles.globalpicturestyle}>
                    <TouchableOpacity
                        onPress={() => {
                            this.props.navigation.navigate('TakePicture', { name: name });
                        }}
                    >
                        <Image
                            style={{ width: 70, height: 70, marginLeft: 30 }}
                            source={require('../assets/images/camera.png')}
                        />
                    </TouchableOpacity>
                    {this._renderPicture(this.getPicturePathParam(name))}
                </View>
            </View>
        );
    }

    _renderPicture(path) {
        if (path) {
            return <Image style={{ width: 130, height: 180, marginRight: '20%' }} source={{ uri: path }} />;
        } else {
            return <View />;
        }
    }

    _updateSections = activeSections => {
        this.setState({ activeSections: activeSections });
    };

    _verifyProduct() {
        if (!this.state.textBrand && !this.state.existingBrand) {
            return false;
        }
        if (!this.state.textName && !this.state.existingName) {
            return false;
        }

        if (this.state.alreadyExist) {
            this.getPicturePathParam(WHOLE);
        }
        return true;
    }

    _validateProduct() {
        if (!this._verifyProduct()) {
            Alert.alert(
                'Champ(s) vide(s) détecté(s)',
                `Le nom, la marque du produit et les trois photos doivent être remplis.`
            );
            return;
        }
        this.setState({ status: 'Ajout en cours...' });

        const args = {
            ean: this.getEan(),
            name: this.state.textName,
            brand: this.state.textBrand,
            wholePicture: this.getPicturePathParam(WHOLE),
            ingredientsPicture: this.getPicturePathParam(INGREDIENTS),
            labels: this.state.textLabel,
            categories: this.state.textCategory
        };
        if (this.getCategory() === FOOD) {
            args.nutritionPicture = this.getPicturePathParam(NUTRITION);
        }
        uploadProductToOFF(args)
            .then(() => {
                Alert.alert('Produit ajouté', `Ce produit a été ajouté avec succès, merci pour votre contribution !`);
                this.props.navigation.navigate('Scan');
            })
            .catch(error => {
                Alert.alert('Un problème est survenu', `Ce produit n'a pas pu être ajouté, merci de réessayer.`);
                this.setState({ addValidate: 'Ajouter ce produit' });
            });
    }

    render() {
        const sections = [
            {
                title: 'Description du produit',
                icon: 'business',
                content: this._renderDescription()
            },
            {
                title: 'Ajouter une photo globale du produit',
                icon: 'photo-camera',
                content: this._renderPictureSection(WHOLE)
            },
            {
                title: 'Ajouter une photo des ingrédients',
                icon: 'room-service',
                content: this._renderPictureSection(INGREDIENTS)
            }
        ];

        if (this.getCategory() === FOOD) {
            sections.push({
                title: 'Ajouter une photo des informations nutritionnelles',
                icon: 'directions-run',
                content: this._renderPictureSection(NUTRITION)
            });
        }

        return (
            <KeyboardAwareScrollView style={{ flex: 1 }} behavior="padding" enabled>
                <Accordion
                    sections={sections}
                    activeSections={this.state.activeSections}
                    renderHeader={this._renderHeader}
                    renderContent={section => section.content}
                    onChange={this._updateSections}
                />
                <TouchableOpacity
                    style={styles.validatecontainer}
                    onPress={() => {
                        this._validateProduct();
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 18 }}>{this.state.status}</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    textHeader: {
        margin: 3
    },
    textinputstyle: {
        height: 50,
        fontSize: 14,
        marginLeft: 5,
        marginRight: 5,
        borderWidth: 1,
        borderColor: '#38b3c5',
        margin: 2
    },

    eanstyle: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 16,
        marginTop: 16,
        marginRight: 7,
        marginLeft: 7
    },
    globalpicturestyle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    validatecontainer: {
        backgroundColor: '#38b3c5',
        borderRadius: 7,
        bottom: 20,
        alignSelf: 'center',
        width: 180,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40
    },
    // accordion
    header: {
        backgroundColor: '#F5FCFF',
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        paddingLeft: 15
    },
    sectionContent: {
        padding: 15,
        backgroundColor: '#fff'
    },
    sectionText: {
        flexWrap: 'wrap',
        flex: 1
    }
});
