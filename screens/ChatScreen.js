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

  const [chats, setChats] = useState([
    { id:'1', name:'Rahul' },
    { id:'2', name:'Arvii' },
    { id:'3', name:'Neha' },
  ]);

  const loadChats = async () => {
    const updated = await Promise.all(
      chats.map(async (chat) => {

        const saved = await AsyncStorage.getItem(`chat_${chat.name}`);
        const unread = await AsyncStorage.getItem(`unread_${chat.name}`);
        const typing = await AsyncStorage.getItem(`typing_${chat.name}`);

        if (saved) {
          const messages = JSON.parse(saved);
          const last = messages[messages.length - 1];

          return {
            ...chat,
            message: last?.text,
            time: last?.time,
            unread: unread ? parseInt(unread) : 0,
            status: last?.status || 'sent',
            sender: last?.sender || 'other',
            typing: typing === 'true'
          };
        }

        return {
          ...chat,
          message: 'Start chatting',
          time: '',
          unread: 0,
          status: 'sent',
          sender: 'other',
          typing: false
        };
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
            onPress={()=>navigation.navigate('ChatDetail',{name:item.name})}
            style={{
              flexDirection:'row',
              paddingVertical:12,
              paddingHorizontal:15,
              borderBottomWidth:0.5,
              borderColor:'#eee',
              alignItems:'center'
            }}
          >

            <Image
              source={{uri:'https://i.pravatar.cc/100'}}
              style={{width:50,height:50,borderRadius:25}}
            />

            <View style={{flex:1, marginLeft:12}}>

              <View style={{
                flexDirection:'row',
                justifyContent:'space-between'
              }}>
                <Text style={{
                  fontWeight: item.unread > 0 ? 'bold' : '600',
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

              <View style={{
                flexDirection:'row',
                justifyContent:'space-between',
                marginTop:4,
                alignItems:'center'
              }}>

                <View style={{flexDirection:'row', alignItems:'center', flex:1}}>

                  {item.sender === 'me' && item.unread === 0 && (
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
                      color: item.typing
                        ? '#25D366'
                        : (item.unread > 0 ? '#000' : '#666'),
                      fontWeight: item.typing
                        ? 'bold'
                        : (item.unread > 0 ? 'bold' : 'normal'),
                      flex:1
                    }}
                  >
                    {item.typing
                      ? 'typing...'
                      : (item.message || 'Start chatting')}
                  </Text>

                </View>

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