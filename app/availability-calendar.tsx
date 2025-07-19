import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Plus, Edit3 } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
  booked?: boolean;
  clientName?: string;
  service?: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  timeSlots: TimeSlot[];
}

export default function AvailabilityCalendarScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    loadSchedule();
  }, [selectedWeek]);

  const generateWeekSchedule = (weekOffset: number): DaySchedule[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const schedule: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const timeSlots: TimeSlot[] = [
        { id: '1', start: '08:00', end: '10:00', available: true },
        { id: '2', start: '10:00', end: '12:00', available: true, booked: i === 1, clientName: 'Marie K.', service: 'Plomberie' },
        { id: '3', start: '14:00', end: '16:00', available: i !== 0, booked: i === 2, clientName: 'Jean M.', service: 'Réparation' },
        { id: '4', start: '16:00', end: '18:00', available: true }
      ];

      schedule.push({
        date: date.toISOString().split('T')[0],
        dayName: days[i],
        timeSlots
      });
    }

    return schedule;
  };

  const loadSchedule = async () => {
    try {
      const savedSchedule = await AsyncStorage.getItem(`schedule_${profile?.id}_week_${selectedWeek}`);
      if (savedSchedule) {
        setWeekSchedule(JSON.parse(savedSchedule));
      } else {
        const defaultSchedule = generateWeekSchedule(selectedWeek);
        setWeekSchedule(defaultSchedule);
        await saveSchedule(defaultSchedule);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      setWeekSchedule(generateWeekSchedule(selectedWeek));
    }
  };

  const saveSchedule = async (schedule: DaySchedule[]) => {
    try {
      await AsyncStorage.setItem(`schedule_${profile?.id}_week_${selectedWeek}`, JSON.stringify(schedule));
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handlePreviousWeek = () => {
    setSelectedWeek(selectedWeek - 1);
  };

  const handleNextWeek = () => {
    setSelectedWeek(selectedWeek + 1);
  };

  const handleTimeSlotPress = (dayDate: string, timeSlot: TimeSlot) => {
    if (timeSlot.booked) {
      Alert.alert(
        'Créneaux réservé',
        `Client: ${timeSlot.clientName}\nService: ${timeSlot.service}\nHeure: ${timeSlot.start} - ${timeSlot.end}`,
        [
          { text: 'OK' },
          { text: 'Voir détails', onPress: () => router.push('/task-details') }
        ]
      );
    } else {
      Alert.alert(
        'Modifier la disponibilité',
        `Créneau: ${timeSlot.start} - ${timeSlot.end}`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: timeSlot.available ? 'Marquer indisponible' : 'Marquer disponible',
            onPress: () => toggleTimeSlotAvailability(dayDate, timeSlot.id)
          }
        ]
      );
    }
  };

  const toggleTimeSlotAvailability = async (dayDate: string, timeSlotId: string) => {
    const newSchedule = weekSchedule.map(day => {
      if (day.date === dayDate) {
        return {
          ...day,
          timeSlots: day.timeSlots.map(slot =>
            slot.id === timeSlotId
              ? { ...slot, available: !slot.available }
              : slot
          )
        };
      }
      return day;
    });

    setWeekSchedule(newSchedule);
    await saveSchedule(newSchedule);
    Alert.alert('Disponibilité mise à jour', 'Vos créneaux ont été mis à jour');
  };

  const handleAddTimeSlot = async (dayDate: string) => {
    Alert.alert(
      'Ajouter un créneau',
      'Sélectionnez les heures de début et de fin',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ajouter',
          onPress: async () => {
            const newTimeSlot: TimeSlot = {
              id: Date.now().toString(),
              start: '09:00',
              end: '11:00',
              available: true
            };

            const newSchedule = weekSchedule.map(day => {
              if (day.date === dayDate) {
                return {
                  ...day,
                  timeSlots: [...day.timeSlots, newTimeSlot]
                };
              }
              return day;
            });

            setWeekSchedule(newSchedule);
            await saveSchedule(newSchedule);
            Alert.alert('Créneau ajouté', 'Le nouveau créneau a été ajouté');
          }
        }
      ]
    );
  };

  const getTimeSlotStyle = (timeSlot: TimeSlot) => {
    if (timeSlot.booked && timeSlot.booking_status === 'confirmed') {
      return [styles.timeSlot, styles.confirmedBooking];
    } else if (timeSlot.booked && timeSlot.booking_status === 'pending') {
      return [styles.timeSlot, styles.pendingBooking];
    } else if (timeSlot.available) {
      return [styles.timeSlot, styles.availableSlot];
    } else {
      return [styles.timeSlot, styles.unavailableSlot];
    }
  };

  const getTimeSlotTextStyle = (timeSlot: TimeSlot) => {
    if (timeSlot.booked) {
      return styles.bookedSlotText;
    } else if (timeSlot.available) {
      return styles.availableSlotText;
    } else {
      return styles.unavailableSlotText;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  const getWeekRange = () => {
    if (weekSchedule.length === 0) return '';
    const firstDay = new Date(weekSchedule[0].date);
    const lastDay = new Date(weekSchedule[6].date);

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: firstDay.getFullYear() !== lastDay.getFullYear() ? 'numeric' : undefined
    };

    return `${firstDay.toLocaleDateString('fr-FR', options)} - ${lastDay.toLocaleDateString('fr-FR', options)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disponibilités</Text>
        <TouchableOpacity onPress={() => Alert.alert('Paramètres', 'Configuration des disponibilités')}>
          <Edit3 size={24} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarHeader}>
        <TouchableOpacity style={styles.weekButton} onPress={handlePreviousWeek}>
          <Text style={styles.weekButtonText}>← Précédent</Text>
        </TouchableOpacity>

        <View style={styles.weekRange}>
          <Text style={styles.weekRangeText}>{getWeekRange()}</Text>
        </View>

        <TouchableOpacity style={styles.weekButton} onPress={handleNextWeek}>
          <Text style={styles.weekButtonText}>Suivant →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.weekView}>
          {weekSchedule.map((day) => (
            <View key={day.date} style={styles.dayColumn}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day.dayName}</Text>
                <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
              </View>

              <View style={styles.timeSlotsContainer}>
                {day.timeSlots.map((timeSlot) => (
                  <TouchableOpacity
                    key={timeSlot.id}
                    style={getTimeSlotStyle(timeSlot)}
                    onPress={() => handleTimeSlotPress(day.date, timeSlot)}
                  >
                    <Text style={getTimeSlotTextStyle(timeSlot)}>
                      {timeSlot.start}
                    </Text>
                    <Text style={getTimeSlotTextStyle(timeSlot)}>
                      {timeSlot.end}
                    </Text>
                    {timeSlot.booked && (
                      <View style={styles.bookingInfo}>
                        <Text style={styles.clientName}>{timeSlot.clientName}</Text>
                        <Text style={styles.serviceName}>{timeSlot.service}</Text>
                      </View>
                    )}
                    {!timeSlot.available && !timeSlot.booked && (
                      <Text style={styles.unavailableText}>Indispo</Text>
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addSlotButton}
                  onPress={() => handleAddTimeSlot(day.date)}
                >
                  <Plus size={16} color="#FF7A00" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Légende</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E8F5E8' }]} />
              <Text style={styles.legendText}>Disponible</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFF3E0' }]} />
              <Text style={styles.legendText}>Réservé</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFEBEE' }]} />
              <Text style={styles.legendText}>Indisponible</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Statistiques de la semaine</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Heures disponibles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Réservations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>67%</Text>
              <Text style={styles.statLabel}>Taux occupation</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Calendar size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Copier semaine</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <Clock size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Horaires récurrents</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  weekButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  weekButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  weekRange: {
    flex: 1,
    alignItems: 'center',
  },
  weekRangeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  weekView: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  dayHeader: {
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
  },
  dayName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  dayDate: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 2,
  },
  timeSlotsContainer: {
    minHeight: 400,
  },
  timeSlot: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableSlot: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  bookedSlot: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  unavailableSlot: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  availableSlotText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
  },
  bookedSlotText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#E65100',
  },
  unavailableSlotText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#C62828',
  },
  bookingInfo: {
    marginTop: 4,
    alignItems: 'center',
  },
  clientName: {
    fontSize: 8,
    fontFamily: 'Inter-SemiBold',
    color: '#E65100',
  },
  serviceName: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: '#E65100',
  },
  unavailableText: {
    fontSize: 8,
    fontFamily: 'Inter-Medium',
    color: '#C62828',
    marginTop: 2,
  },
  addSlotButton: {
    borderWidth: 1,
    borderColor: '#FF7A00',
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  legend: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  pendingBooking: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF7A00',
    borderStyle: 'dashed',
  },
  confirmedBooking: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
});