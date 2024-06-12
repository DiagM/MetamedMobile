import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api'; // Adjust the path as necessary
import { useNavigation } from '@react-navigation/native';

export default function Login({ expoPushToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password cannot be empty');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Invalid email format');
      return;
    }

    try {
      const response = await api.post('/login', { email, password });
      const { token } = response.data;
      
      // Store token securely
      await AsyncStorage.setItem('token', token);
      
      // Save push token if available
      if (expoPushToken) {
        await savePushTokenToBackend(token, expoPushToken);
        await AsyncStorage.setItem('expoPushToken', expoPushToken);

      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeTabs' }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Login failed', 'Invalid credentials');
    }
  };

  const savePushTokenToBackend = async (token, pushToken) => {
    try {
      await api.post('/save-push-token', {
        token: pushToken
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log();
    } catch (error) {
      console.error('Failed to save push token', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.bgImage} source={require('../assets/images/login_background.jpg')} />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputs}
          placeholder="Email"
          keyboardType="email-address"
          underlineColorAndroid="transparent"
          onChangeText={setEmail}
        />
        <Image
          style={styles.inputIcon}
          source={{ uri: 'https://img.icons8.com/nolan/40/000000/email.png' }}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputs}
          placeholder="Password"
          secureTextEntry={true}
          underlineColorAndroid="transparent"
          onChangeText={setPassword}
        />
        <Image
          style={styles.inputIcon}
          source={{ uri: 'https://img.icons8.com/nolan/40/000000/key.png' }}
        />
      </View>

      <TouchableOpacity
        style={styles.btnForgotPassword}
        onPress={() => Alert.alert('Forgot password', 'Password reset process')}>
        <Text style={styles.btnText}>Forgot your password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonContainer, styles.loginButton]}
        onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => Alert.alert('Sign up', 'Registration process')}>
        <Text style={styles.btnText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCDCDC',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 300,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#808080',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
    justifyContent: 'center',
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 300,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  btnForgotPassword: {
    height: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 10,
    width: 300,
    backgroundColor: 'transparent',
  },
  loginButton: {
    backgroundColor: '#00b5ec',

    shadowColor: '#808080',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12.35,

    elevation: 19,
  },
  loginText: {
    color: 'white',
  },
  bgImage: {
    flex: 1,
    resizeMode: 'cover',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
