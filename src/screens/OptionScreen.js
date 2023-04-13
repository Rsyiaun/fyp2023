import React, { useEffect, useState } from "react";
import { View, Text, Image, ImageBackground, Linking } from "react-native";
import { Button, Overlay } from "react-native-elements";
import * as FileSystem from "expo-file-system";
import {
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import exampleImage from "../images/select.png";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
const predictionList = require('./predictionList.json');
function OptionScreen({ navigation }) {
  const [hasGalleryPermisson, setHasGalleryPermission] = useState(null);
  const [image, setImage] = useState(
    Image.resolveAssetSource(exampleImage).uri
  );
  const [path, setPath] = useState("asd");
  const [isSetImage, setIsSetImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPredicted, setIsPredicted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [OverlayText, setOverlayText] = useState("Loading...");
  const [overlayImage, setOverlayImage] = useState(null);
  const [url, setUrl] = useState("");
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    (async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    // console.log(result.assets);

    if (!result.canceled) {
      console.log("Success Import Image ");
      setImage(result.assets[0].uri);
      setIsSetImage(true);
      console.log("Image: ", image);
      try {
        const response = await FileSystem.uploadAsync(
          `http://10.0.2.2:5000/binary-upload`,
          result.assets[0].uri,
          {
            fieldName: "file",
            httpMethod: "PATCH",
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          }
        );
        console.log(JSON.stringify(response, null, 4));
        setPath(response.body);
        console.log("Path1: ", path);
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (hasGalleryPermisson === false) {
    return <Text> No access to Internal Storage</Text>;
  }
  const linking = () => {
    Linking.openURL(url);
  };
  const predict = () => {
    setIsLoading(true);
    console.log("predict");
    // console.log("Is loading: ", isLoading);
    // console.log("Path2: ", path);

    axios
      .get("http://10.0.2.2:5000/api", {
        params: {
          path: path,
        },
      })
      .then((response) => {
        // handle success
        console.log(response.data);
        setIsLoading(false);
        setIsPredicted(true);
        toggleOverlay();
        
        
         
        var overlayString = "Prediction Result:" + "\n" + "----------------------------------" + "\n";
        var uri = `https://www.google.com/search?q=`
        {
          response.data.map((item) => {
            overlayString += 
            "Label: " + item.label + "\n"+
            "Confidence: " + item.confidence + "\n" +
            "----------------------------------" + "\n";
            uri+=item.label+`|`;
          });
          
        }
        setUrl(uri);
        setOverlayImage(image)
        setOverlayText(overlayString);
       updateJson(response.data);
        


        
      })
      .catch((error) => {
        // handle error
        console.log(error);
        setIsLoading(false);
      });
      
  };

  const updateJson = (rawData) => {
    axios
      .get("http://10.0.2.2:5000/api2", {
        params: {
          data: rawData,
        },
      })
      .then((response) => {
        // handle success
        console.log(response.data);

      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  };


  return (
    <View
      style={{
        backgroundColor: "#FFF",
        flex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: "#00a46c",
          height: "28%",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 35,
            width: "100%",
          }}
        >
          <View style={{ width: "50%" }}>
            <Text
              style={{
                fontSize: 28,
                color: "#FFF",
                fontWeight: "bold",
              }}
            >
              Hi, User~
              <View>
                {isPredicted && (
                  <Button title="Recent Prediction" onPress={toggleOverlay} />
                )}

                <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
                {overlayImage && (
                  <Image source={{ uri: overlayImage }} style={{ width: 200, height: 200 }} />
                )}
                  <Text>{OverlayText}</Text>
                  <Button title="Search For More Details" onPress={linking} />
                </Overlay>
              </View>
            </Text>
          </View>
          <View style={{ width: "50%", alignItems: "flex-end" }}>
            <Image
              source={require("../images/icon-removebg.png")}
              style={{ height: 160, width: 160 }}
            />
          </View>
        </View>
      </View>
      <LinearGradient
        colors={["rgba(0,164,109,0.4)", "transparent"]}
        style={{
          left: 0,
          right: 0,
          height: 90,
          marginTop: -45,
        }}
      >

      </LinearGradient>
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          width: "100%",
          alignItems: "center",
        }}
      >
        <View style={{ width: "50%" }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 17,
              color: "#585a61",
            }}
          >
            Choose your image
          </Text>
          <View
            style={{
              height: 4,
              backgroundColor: "#b1e5d3",
              width: 150,
              marginTop: -3,
            }}
          ></View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          height: "30%",
          width: "100%",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "column",
            width: "50%",
          }}
        >
          <Button
            title="From Camera Roll"
            onPress={pickImage}
            buttonStyle={{
              backgroundColor: "rgba(111, 202, 186, 1)",
              borderRadius: 30,
              marginTop: 10,
            }}
            titleStyle={{ color: "black" }}
            icon={{
              name: "folder-open",
              type: "font-awesome",
              size: 15,
              color: "black",
            }}
            iconRight
          />
        </View>
        {image && (
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
        )}

        {/* <TouchableOpacity 
                        style={{flex:1}}E
                        onPress={()=>pickImage}
                    >

                    <Image
                        source={require("../images/icon.png")}
                        style={{marginTop:20, height:180,width:200}}
                        onPress={()=>pickImage}
                    />
                    </TouchableOpacity> */}

        {/* <Image
                        source={require("../images/icon.png")}
                        style={{marginTop:20, width:"50%", height:"100%"}}
                    /> */}
      </View>

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          width: "100%",
          alignItems: "center",
        }}
      >
        <View style={{ width: "50%" }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 17,
              color: "#585a61",
            }}
          >
            Previous Prediction
          </Text>
          <View
            style={{
              height: 4,
              backgroundColor: "#b1e5d3",
              width: 150,
              marginTop: -3,
            }}
          ></View>
        </View>
        <View style={{ width: "50%", alignItems: "flex-end" }}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 5,
              borderRadius: 15,
            }}
          >
            <Button
              title="Predict"
              onPress={predict}
              buttonStyle={{
                backgroundColor: "rgba(111, 202, 186, 1)",
                borderRadius: 30,
              }}
              disabled={isSetImage ? false : true}
              icon={{
                name: "arrow-right",
                type: "font-awesome",
                size: 15,
                color: "white",
              }}
              loading={isLoading}
            />
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 400 }}
      >
        <LinearGradient
          colors={["rgba(0,164,109,0.09)", "transparent"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 100,
            marginTop: 220,
            top: 0,
          }}
        />
        {predictionList.slice(-3).map((array, index) => {
          return (
            <>
              {array.map((key, index) => {
                return (
                  
                    <TouchableOpacity
                      style={{
                        height: 250,
                        elevation: 2,
                        backgroundColor: "#FFF",
                        marginLeft: 20,
                        marginTop: 20,
                        borderRadius: 15,
                        marginBottom: 10,
                        width: 160,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          paddingTop: 10,
                          paddingHorizontal: 10,
                        }}
                      ><ImageBackground source={image} >
                        <Text
                          style={{
                            fontWeight: "bold",
                            width: "50%",
                          }}
                        >
                          {key.label}
                        </Text>

                        <Text
                          style={{
                            fontWeight: "bold",
                            color: "#00a46c",
                            paddingLeft: 35,
                          }}
                        >
                          {key.confidence}%
                        </Text></ImageBackground>
                      </View>
                    </TouchableOpacity>
                  
                );
              })}
            </>
          );
        })}
      </ScrollView>
    </View>
  );
}
export default OptionScreen;
