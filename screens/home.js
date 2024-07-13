import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Linking, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import api from '../utils/api'; // Adjust the path as necessary

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 60,
  },
  listContainer: {
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#A9A9A9',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  card: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    backgroundColor:  'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 5,
  },
  cardDates: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  cardDate: {
    color: '#888',
  },
  cardContent: {
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  attendeesContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  attendeeImage: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginLeft: -10,
    borderWidth: 0.5,
    marginTop: 3,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  actionButton: {
    backgroundColor: '#7d3665',
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff5900',
    marginRight: 10,
  },
  buttonText: {
    color: '#ff5900',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [medicalFiles, setMedicalFiles] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const userResponse = await api.get('/user', { headers: { Authorization: `Bearer ${token}` } });
          setUser(userResponse.data);

          const filesResponse = await api.get('/patient/files', { headers: { Authorization: `Bearer ${token}` } });
          setMedicalFiles(filesResponse.data);
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch data. Please try again later.');
        navigation.navigate('Login');
      }
    }

    fetchData();
  }, []);

  const handleDownload = (fileName) => {
    const fileUrl = `http://192.168.1.44:8000/api/download?url=medical_files/${fileName}`;
    Linking.openURL(fileUrl);
  };

  const renderMedicalFile = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDates}>
        <Text style={styles.cardDate}>{item.date}</Text>
        <Text style={styles.cardDate}> added by :{item.doctor.name}</Text>
      </Text>
      <Text style={styles.cardContent}>description: {item.description}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDownload(item.file_name)}>
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <ImageBackground source={require('../assets/images/medicalfilebgimage.jpg')} style={styles.backgroundImage}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../assets/images/medicalfilebgimage.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <FlatList
          data={medicalFiles}
          renderItem={renderMedicalFile}
          keyExtractor={(item) => item.id.toString()}
          style={styles.listContainer}
        />
      </View>
    </ImageBackground>
  );
}
