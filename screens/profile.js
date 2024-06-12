import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api'; // Adjust the path as necessary
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await api.get('/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error(error);
      // Redirect to login if token is invalid or expired
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Retrieve push token from AsyncStorage
      const pushToken = await AsyncStorage.getItem('expoPushToken');

      // Delete push token if it exists
      if (pushToken) {
        await deletePushToken(pushToken);
      }
      
      await api.post('/logout');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('expoPushToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deletePushToken = async (pushToken) => {
    try {
      const token = await AsyncStorage.getItem('token');
  
      await api.post('/delete-push-token', {
        token: pushToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      console.log('Push token deleted successfully');
    } catch (error) {
      console.error('Failed to delete push token', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const nameArray = name.split(' ');
    if (nameArray.length === 1) {
      return nameArray[0].charAt(0).toUpperCase();
    } else {
      return (
        nameArray[0].charAt(0).toUpperCase() +
        nameArray[nameArray.length - 1].charAt(0).toUpperCase()
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </View>
        <View style={styles.informationContainer}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.label}>{user?.email}</Text>
          <Text style={styles.label}>licence number: {user?.license_number}</Text>
          <Text style={styles.label}>contact: {user?.contact}</Text>
          <Text style={styles.label}>Address: {user?.address}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionBody}>

        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#ffa071',
    height: 250,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ff7f50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 50,
    color: '#FFF',
  },
  informationContainer: {
    flex: 1,
    marginLeft: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  label: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#ffa071',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  logoutButtonText: {
    color: '#eee'
  },
  sectionBody: {
    marginTop: 10,
  },
  sectionScroll: {
    paddingBottom: 20,
  },
  sectionCard: {
    width: 200,
    minHeight: 200,
    backgroundColor: '#fff',
    shadowColor: '#B0C4DE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  sectionImage: {
    width: '100%',
    aspectRatio: 1,
  },
  sectionInfo: {
    padding: 10,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
});
