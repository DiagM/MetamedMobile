import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import api from '../utils/api'; 

const ScheduleScreen = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const renderClassItem = ({ item }) => (
    <View style={styles.classItem}>
      <View style={styles.timelineContainer}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineLine} />
      </View>

      <View style={styles.classContent}>
        <View style={styles.classHours}>
          <Text style={styles.startTime}>{formatTime(item.start_datetime)}</Text>
          <Text style={styles.endTime}>{formatTime(item.end_datetime)}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: getColorForLabel(item.label) }]}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDate}>{formatDate(item.start_datetime)}</Text>
          <FlatList
            contentContainerStyle={styles.patientListContainer}
            data={item.patients}
            keyExtractor={(patient) => patient.id.toString()}
            horizontal
          />
          <View style={styles.doctorInfo}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.doctor.name}</Text>
              <Text style={styles.userRole}>{item.description}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Appointments</Text>
      </View>
    </View>
  );

  const formatDate = (datetime) => {
    const date = new Date(datetime);
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (datetime) => {
    const date = new Date(datetime);
    return `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
  };

  const getColorForLabel = (label) => {
    switch (label) {
      case 'Examination':
        return '#E0FFFF'; // Light Cyan
      case 'Consultation':
        return '#E6E6FA'; // Lavender
      case 'Follow-up':
        return '#FAF0E6'; // Linen
      case 'Procedure':
        return '#FFD700'; // Gold
      case 'Other':
        return '#ffa2a2'; // Light Salmon
      default:
        return '#FAFAD2'; // Light Goldenrod Yellow
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16 }}
        data={reservations}
        renderItem={renderClassItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#ff7f50',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1007fa',
  },
  userRole: {
    fontSize: 12,
    color: '#3f42ff',
  },
  classItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineContainer: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff7f50',
    marginBottom: 8,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#ff7f50',
  },
  classContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  classHours: {
    marginRight: 8,
    alignItems: 'flex-end',
  },
  startTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  endTime: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 16,
    color: '#00008B',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#00008B',
    marginBottom: 8,
  },
  patientListContainer: {
    marginRight: 10,
  },
  patientAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: -3,
    borderWidth: 1,
    borderColor: '#fff',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default ScheduleScreen;
