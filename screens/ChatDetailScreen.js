import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatDetailScreen({ route, navigation }) {
  const { name } = route.params;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const flatListRef = useRef();

  useEffect(() => {
    loadMessages();
    markAsRead();
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveMessages();
  }, [messages]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{color:'#fff', fontWeight:'bold'}}>
            {name}
          </Text>
          <Text style={{color:'#ccc', fontSize:12}}>
            {typing ? 'typing...' : 'online'}
          </Text>
        </View>
      ),
      headerStyle: { backgroundColor: '#075E54' },
      headerTintColor: '#fff'
    });
  }, [typing]);

  const loadMessages = async () => {
    const saved = await AsyncStorage.getItem(`chat_${name}`);
    if (saved) setMessages(JSON.parse(saved));
  };

  const saveMessages = async () => {
    await AsyncStorage.setItem(`chat_${name}`, JSON.stringify(messages));
  };

  const markAsRead = async () => {
    await AsyncStorage.setItem(`unread_${name}`, '0');
  };

  const getTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour:'2-digit',
      minute:'2-digit'
    });
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      time: getTime(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, status: 'read' }
            : msg
        )
      );
    }, 1000);

    // START typing
    setTyping(true);
    await AsyncStorage.setItem(`typing_${name}`, 'true');

    setTimeout(async () => {

      // STOP typing
      setTyping(false);
      await AsyncStorage.setItem(`typing_${name}`, 'false');

      const reply = {
        id: Date.now().toString(),
        text: 'Reply 🙂',
        sender: 'other',
        time: getTime(),
        status: 'read'
      };

      setMessages(prev => [...prev, reply]);

      const current = await AsyncStorage.getItem(`unread_${name}`);
      const count = current ? parseInt(current) : 0;

      await AsyncStorage.setItem(`unread_${name}`, (count+1).toString());

    },1500);
  };

  return (
    <KeyboardAvoidingView
      style={{flex:1}}
      behavior={Platform.OS==='ios'?'padding':'height'}
      keyboardVerticalOffset={80}
    >

      <View style={{flex:1, backgroundColor:'#e5ddd5'}}>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item)=>item.id}
          contentContainerStyle={{padding:10}}
          keyboardShouldPersistTaps="handled"
          renderItem={({item}) => (

            <View style={{
              alignSelf: item.sender==='me'?'flex-end':'flex-start',
              backgroundColor: item.sender==='me'?'#DCF8C6':'#fff',
              paddingVertical:8,
              paddingHorizontal:12,
              borderRadius:10,
              marginVertical:4,
              maxWidth:'75%'
            }}>
              <Text>{item.text}</Text>

              {item.sender === 'me' && (
                <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
                  <Text style={{fontSize:10,color:'gray'}}>
                    {item.time}
                  </Text>

                  <Ionicons
                    name="checkmark-done"
                    size={14}
                    color={item.status==='read'?'blue':'gray'}
                    style={{marginLeft:5}}
                  />
                </View>
              )}

              {item.sender === 'other' && (
                <Text style={{
                  fontSize:10,
                  color:'gray',
                  alignSelf:'flex-end'
                }}>
                  {item.time}
                </Text>
              )}

            </View>

          )}
        />

        {/* Input */}
        <View style={{
          flexDirection:'row',
          padding:10,
          backgroundColor:'#fff'
        }}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            style={{
              flex:1,
              backgroundColor:'#f0f0f0',
              borderRadius:25,
              paddingHorizontal:15,
              paddingVertical:10
            }}
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={{
              marginLeft:10,
              backgroundColor:'#25D366',
              borderRadius:25,
              padding:12
            }}
          >
            <Ionicons name="send" size={20} color="#fff"/>
          </TouchableOpacity>
        </View>

      </View>

    </KeyboardAvoidingView>
  );
}