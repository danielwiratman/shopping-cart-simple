import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

const ShoppingCartScreen = () => {
    const [cartData, setCartData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [productData, setProductData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [total, setTotal] = useState(0);
    const [price, setPrice] = useState(0);
    const [portrait, setPortrait] = useState(true);

    const capitalize = (s) => {
        return s[0].toUpperCase() + s.slice(1);
    };
    const numberWithCommas = (s) => {
        return s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const API_URL =
        "https://a372-2001-448a-5020-8c11-c473-47b4-f66d-7c14.ap.ngrok.io";

    const getData = () => {
        fetch(`${API_URL}/carts`)
            .then((res) => res.json())
            .then((json) => {
                setCartData(json);
            })
            .catch((error) => {
                console.error(error);
            });
        fetch(`${API_URL}/users`)
            .then((res) => res.json())
            .then((json) => {
                setUserData(json);
            })
            .catch((error) => {
                console.error(error);
            });
        fetch(`${API_URL}/products`)
            .then((res) => res.json())
            .then((json) => {
                setProductData(json);
            })
            .catch((error) => {
                console.error(error);
            });
        updateTotal();
        let port = Dimensions.get("window").width >= 500 ? false : true;
        setPortrait(port);
    };

    const changeCartData = (item) => {
        const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        };
        fetch(`${API_URL}/carts/${item.id}`, requestOptions).then((response) =>
            response.json()
        );
    };

    const deleteCartData = (item) => {
        const requestOptions = {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        };
        fetch(`${API_URL}/carts/${item.id}`, requestOptions).then((response) =>
            response.json()
        );
    };

    const addDummyCartData = (productId) => {
        const lastId = cartData[cartData.length - 1].id;
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: lastId + 1,
                userId: 1,
                productId: productId,
                total: 1,
            }),
        };
        fetch(`${API_URL}/carts`, requestOptions).then((response) =>
            response.json()
        );
        getData();
    };

    const minusQuantity = (item) => {
        let total = item.total;
        total--;
        let newData = { ...item, total: total };
        changeCartData(newData);
        getData();
    };

    const plusQuantity = (item) => {
        let total = item.total;
        total++;
        let newData = { ...item, total: total };
        changeCartData(newData);
        getData();
    };

    const trashButton = (item) => {
        Alert.alert(
            "Delete Item",
            "Are you sure to delete this item?",
            [
                {
                    text: "Cancel",
                },
                {
                    text: "Yes",
                    onPress: () => {
                        deleteCartData(item);
                        getData();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const updateTotal = () => {
        let newTotal = 0;
        cartData.map((data) => {
            newTotal += data.total;
        });
        let newPrice = 0;
        cartData.map((data) => {
            newPrice +=
                data.total *
                productData.filter((product) => {
                    return product.id == data.productId;
                })[0].price;
        });
        setPrice(newPrice);
        setTotal(newTotal);
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <View style={styles.mainContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Shopping Cart</Text>
            </View>

            <FlatList
                data={cartData}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={getData}
                    />
                }
                renderItem={({ item }) => {
                    while (productData.length < 1) {
                        getData();
                    }
                    const title = productData.filter((data) => {
                        return data.id == item.productId;
                    })[0].title;
                    const image = productData.filter((data) => {
                        return data.id == item.productId;
                    })[0].image;
                    const description = productData.filter((data) => {
                        return data.id == item.productId;
                    })[0].description;
                    const itemPrice = productData.filter((data) => {
                        return data.id == item.productId;
                    })[0].price;
                    let lastStock = item.total == 1;
                    return (
                        <View style={styles.cardContainer}>
                            <Image
                                style={styles.cardImage}
                                source={{ uri: image }}
                            />
                            <View style={styles.titlePriceContainer}>
                                <Text style={styles.prodNameText}>
                                    {capitalize(title)}
                                </Text>
                                <Text style={styles.priceText}>
                                    {"Rp" + numberWithCommas(itemPrice)}
                                </Text>
                            </View>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    onPress={() => minusQuantity(item)}
                                    disabled={lastStock}
                                >
                                    <AntDesign
                                        name="minus"
                                        size={20}
                                        style={[
                                            styles.iconStyle,
                                            {
                                                backgroundColor: lastStock
                                                    ? "#F49898"
                                                    : "#F44236",
                                            },
                                        ]}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>
                                    {item.total}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => plusQuantity(item)}
                                >
                                    <AntDesign
                                        name="plus"
                                        size={20}
                                        style={[
                                            styles.iconStyle,
                                            { backgroundColor: "#4FC2F7" },
                                        ]}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => trashButton(item)}
                                    style={styles.trash}
                                >
                                    <FontAwesome
                                        name="trash"
                                        size={20}
                                        style={styles.iconStyle}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
            <View style={styles.dummyButtonContainer}>
                <Text style={{ fontSize: 16 }}>Dummy Product</Text>
                <TouchableOpacity
                    style={{
                        backgroundColor: "#4CB050",
                        padding: 8,
                        borderRadius: 10,
                    }}
                    // addDummyCartData(2) untuk product satunya
                    onPress={() => addDummyCartData(1)}
                >
                    <AntDesign name="plus" size={20} color="white" />
                </TouchableOpacity>
            </View>
            <View style={styles.bottomBarContainer}>
                <View style={styles.cartTotalContainer}>
                    <View style={styles.cartTotal}>
                        <FontAwesome
                            name="shopping-cart"
                            size={24}
                            color="black"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={{ fontSize: 16 }}>{total}</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 16 }}>
                            Total - Rp
                            {numberWithCommas(price)}
                        </Text>
                    </View>
                </View>
                <View style={styles.twoButtonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.bottomButton,
                            { width: portrait ? "50%" : 200 },
                        ]}
                    >
                        <Text style={styles.bottomButtonText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.bottomButton,
                            {
                                backgroundColor: "#4FC2F7",
                                width: portrait ? "50%" : 200,
                            },
                        ]}
                    >
                        <Text style={styles.bottomButtonText}>
                            Go to Checkout
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#DCDCDC",
    },
    headerContainer: {
        backgroundColor: "white",
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 24,
    },
    cardContainer: {
        margin: 8,
        padding: 8,
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
    },
    cardImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
    },
    titlePriceContainer: {
        paddingHorizontal: 8,
        flexGrow: 1,
    },
    prodNameText: {
        fontSize: 17,
    },
    priceText: {
        padding: 4,
        borderRadius: 5,
        textAlign: "center",
        color: "white",
        backgroundColor: "#4CB050",
        width: 100,
    },
    quantityContainer: {
        width: wp("35%"),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    quantityText: {
        paddingHorizontal: 16,
        fontSize: 16,
    },
    trash: {
        marginLeft: 8,
    },
    dummyButtonContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    iconStyle: {
        backgroundColor: "#F44236",
        borderRadius: 5,
        color: "white",
        padding: 6,
    },
    bottomBarContainer: {
        backgroundColor: "white",
    },
    cartTotalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    cartTotal: {
        flexDirection: "row",
        alignItems: "center",
    },
    twoButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    bottomButton: {
        width: "50%",
        backgroundColor: "#F44236",
        justifyContent: "center",
        alignItems: "center",
        height: hp("7%"),
        borderRadius: 5,
    },
    bottomButtonText: {
        color: "white",
        fontSize: 16,
    },
});

export default ShoppingCartScreen;
