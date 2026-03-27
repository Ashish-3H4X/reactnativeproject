import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';

const socket = io('http://10.205.189.221:5000');

export default function ChatDetailScreen({ route, navigation }) {
  const { name } = route.params;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef = useRef();

  useEffect(() => {
    loadMessages();
    markAsReadBackend();
  }, []);

  // 🔥 SOCKET
  useEffect(() => {
    socket.on('receive_message', (data) => {
      if (data.sender === name || data.receiver === name) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => socket.disconnect();
  }, []);

  // 🔥 KEYBOARD LISTENER (MAIN FIX)
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: name,
      headerStyle: { backgroundColor: '#075E54' },
      headerTintColor: '#fff'
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadMessages = async () => {
    const res = await fetch(
      `http://10.205.189.221:5000/api/messages/me/${name}`
    );
    const data = await res.json();
    setMessages(data);
  };

  const markAsReadBackend = async () => {
    await fetch('http://10.205.189.221:5000/api/messages/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: name,
        receiver: 'me'
      })
    });
  };

  const getTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      sender: 'me',
      receiver: name,
      text: message,
      time: getTime(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    await fetch('http://10.205.189.221:5000/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage)
    });

    socket.emit('send_message', newMessage);

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.time === newMessage.time
            ? { ...msg, status: 'read' }
            : msg
        )
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e5ddd5' }}>
      
      <View style={{ flex: 1 }}>

        {/* CHAT LIST */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, i) => i.toString()}
          contentContainerStyle={{
            padding: 10,
            paddingBottom: 100
          }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (

            <View style={{
              alignSelf: item.sender === 'me' ? 'flex-end' : 'flex-start',
              backgroundColor: item.sender === 'me' ? '#DCF8C6' : '#fff',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 10,
              marginVertical: 4,
              maxWidth: '75%',
              elevation: 1
            }}>
              <Text>{item.text}</Text>

              <View style={{
                flexDirection: 'row',
                alignSelf: 'flex-end',
                marginTop: 4
              }}>
                <Text style={{ fontSize: 10, color: 'gray' }}>
                  {item.time}
                </Text>

                {item.sender === 'me' && (
                  <Ionicons
                    name="checkmark-done"
                    size={14}
                    color={item.status === 'read' ? 'blue' : 'gray'}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>

            </View>

          )}
        />

        {/* 🔥 INPUT (KEYBOARD FIXED) */}
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: keyboardHeight, // 🔥 MAIN FIX
          flexDirection: 'row',
          padding: 10,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderColor: '#979393'
        }}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type message"
            style={{
              flex: 1,
              backgroundColor: '#f0f0f0',
              borderRadius: 25,
              paddingHorizontal: 15,
              paddingVertical: 8
            }}
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={{
              marginLeft: 10,
              backgroundColor: '#25D366',
              borderRadius: 25,
              padding: 10
            }}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

      </View>

    </SafeAreaView>
  );
}