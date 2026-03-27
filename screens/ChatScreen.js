import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ navigation }) {

  const baseChats = [
    { id:'1', name:'Rahul' },
    { id:'2', name:'Arvii' },
    { id:'3', name:'Neha' },
  ];

  const [chats, setChats] = useState(baseChats);

  const loadChats = async () => {

    const updated = await Promise.all(
      baseChats.map(async (chat) => {

        try {
          const res = await fetch(
            `http://10.205.189.221:5000/api/messages/me/${chat.name}`
          );
          const messages = await res.json();

          const last = messages[messages.length - 1];

          const unread = await AsyncStorage.getItem(`unread_${chat.name}`);

          return {
            ...chat,
            message: last?.text || '',
            time: last?.time || '',
            sender: last?.sender || '',
            status: last?.status || 'read',
            unread: unread ? parseInt(unread) : 0
          };

        } catch (err) {
          console.log(err);
          return chat;
        }
      })
    );

    setChats(updated);
  };

  useEffect(() => {
    loadChats();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );

  return (
    <View style={{flex:1, backgroundColor:'#fff'}}>

      <FlatList
        data={chats}
        keyExtractor={(item)=>item.id}
        renderItem={({item}) => (

          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.setItem(`unread_${item.name}`, '0');
              navigation.navigate('ChatDetail', { name:item.name });
            }}
            style={{
              flexDirection:'row',
              paddingVertical:12,
              paddingHorizontal:15,
              borderBottomWidth:0.5,
              borderColor:'#eee',
              alignItems:'center'
            }}
          >

            {/* Avatar */}
            <Image
              source={{uri:'https://i.pravatar.cc/100'}}
              style={{width:50,height:50,borderRadius:25}}
            />

            {/* Content */}
            <View style={{flex:1, marginLeft:12}}>

              {/* Name + Time */}
              <View style={{
                flexDirection:'row',
                justifyContent:'space-between'
              }}>
                <Text style={{
                  fontWeight: item.unread>0 ? 'bold' : '600',
                  fontSize:16
                }}>
                  {item.name}
                </Text>

                <Text style={{
                  fontSize:12,
                  color:'#999'
                }}>
                  {item.time}
                </Text>
              </View>

              {/* Message Row */}
              <View style={{
                flexDirection:'row',
                justifyContent:'space-between',
                marginTop:4,
                alignItems:'center'
              }}>

                <View style={{
                  flexDirection:'row',
                  alignItems:'center',
                  flex:1
                }}>

                  {/* ✔✔ only for MY message */}
                  {item.sender === 'me' && (
                    <Ionicons
                      name="checkmark-done"
                      size={16}
                      color={item.status === 'read' ? 'blue' : 'gray'}
                      style={{marginRight:5}}
                    />
                  )}

                  <Text
                    numberOfLines={1}
                    style={{
                      color: item.unread>0 ? '#000' : '#666',
                      fontWeight: item.unread>0 ? 'bold' : 'normal',
                      flex:1
                    }}
                  >
                    {item.message || 'Start chatting'}
                  </Text>

                </View>

                {/* 🔴 Unread badge */}
                {item.unread > 0 && (
                  <View style={{
                    backgroundColor:'#25D366',
                    borderRadius:20,
                    minWidth:20,
                    height:20,
                    justifyContent:'center',
                    alignItems:'center',
                    paddingHorizontal:6,
                    marginLeft:5
                  }}>
                    <Text style={{
                      color:'#fff',
                      fontSize:11,
                      fontWeight:'bold'
                    }}>
                      {item.unread}
                    </Text>
                  </View>
                )}

              </View>

            </View>

          </TouchableOpacity>

        )}
      />

    </View>
  );
}