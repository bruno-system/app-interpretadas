import React, {useState,useEffect} from 'react';
import { StyleSheet, View, Button,Image, Dimensions,TouchableOpacity, AsyncStorage } from 'react-native';
import  Icon  from 'react-native-vector-icons/FontAwesome';

export default function App() {
  const [currentImageUrl, setImageUrl] = useState(null);
  const [currentImageFavStatus, setImageFavStatus] = useState(false);

  const DOUBLE_PRESS_DELAY = 300;
  let lastTimeImagePress = null;

  useEffect(() => {
    loadRandomImage();
  }, []);


  const loadRandomImage = () => {
    const width = Math.floor(Dimensions.get('window').width);
    const height = Math.floor(Dimensions.get('window').height);

    fetch('https://picsum.photos/'+width+'/'+height)
    .then(async function (response){
      // guaramos en el state la url de la foto random
      setImageUrl(response.url);

      //Hay que determinar si la imagen ya es favorita
      //todas mis imagenes guardads como string
      const favImagesJSONStr = await AsyncStorage.getItem('@favImaesJSON', () => {});
      //tomo mis imagenes string y las paso a JSON
      const favImagesJSON = JSON.parse(favImagesJSONStr);
      //guarda en randomImageFavStatus si tengo favoritas gardadas y si la imagen acutal esta dentro de mis favoritas
      const randomImageFavStatus = favImagesJSON !== null && favImagesJSON.urls.includes(response.url);
      //si la imagen actual no estaba en mis favoritas y ahora es favorita
      if(randomImageFavStatus !== currentImageFavStatus){
        setImageFavStatus(randomImageFavStatus);
      }
    });
  }

  const imageTap = () =>{
    const now = new Date().getTime();

    if(lastTimeImagePress !== null && (now - lastTimeImagePress) < DOUBLE_PRESS_DELAY){
      lastTimeImagePress = null;
      toggleImageFavStatus().then(()=>{});
    }else{
      lastTimeImagePress = now;
    }
  }

  const toggleImageFavStatus = async () => {
    const newFavStatus = !currentImageFavStatus;

    const favImagesJSONStr= await AsyncStorage.getItem('@favImagesJSON',() => {});
    let favImagesJSON = JSON.parse(favImagesJSONStr);
    //priemra vez q guardo
    if(favImagesJSON === null){
      favImagesJSON = {
        urls: []
      };
    }
    
    //Si la foto es favorita
    if(newFavStatus){
      //agregar url a urls favoritas
      favImagesJSON.url.push(currentImageUrl);
    }else{
      //eliminar img de urls
      favImagesJSON.url = favImagesJSON.urls.filter((value) => {return value !== currentImageUrl});
    }

    //guardo
    await AsyncStorage.setItem('@favImagesJSON',JSON.stringify(favImagesJSON), () => {});
    setImageFavStatus(newFavStatus);
  } 

  

  return (
    <View style={styles.main}>
      <TouchableOpacity onPress={imageTap} style={styles.TouchableOpacity}>
        {(currentImageUrl != null) && (
          <View style={styles.imageHolder}>
                <Image style={styles.image} source={{ uri: currentImageUrl }} />
                <TouchableOpacity onPress={toggleImageFavStatus} style={styles.favIconTouchableOpacity}>
                  <Icon
                    name={currentImageFavStatus === false ? "heart-0" : "heart" }
                    size={30}
                    color={ currentImageFavStatus === false ? "#000" : "#F00"} 
                  />
                </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>    
      <View style={styles.footer}>
        <Button title="Descubrir nueva" onPress={loadRandomImage} />
        <Button title="Mis favoritas" onPress={() => { }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main:{
    flex:1,
    flexDirection:'column',
  },
  imageHolder:{
    flex:1
  },
  footer:{
    position:'absolute',
    left:0,
    right:0,
    bottom:0,
    flexDirection:'row',
    justifyContent:'space-between',
    padding:8,
  },
  image:{
    flex:1
  }
});
