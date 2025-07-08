// components/WhatsAppBottomNotification.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform
} from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface SnackBarProps {
  message: string;
  type: NotificationType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const SnackBar: React.FC<SnackBarProps> = ({ message, type, visible, onHide, duration = 2500, }) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getIcon = () => {
    const iconProps = { size: 16, color: getIconColor() };

    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <XCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return <CheckCircle {...iconProps} />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4ADE80'; // green-400
      case 'error':
        return '#F87171'; // red-400
      case 'warning':
        return '#FBBF24'; // yellow-400
      case 'info':
        return '#60A5FA'; // blue-400
      default:
        return '#4ADE80';
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.notification,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          <Text style={styles.message} numberOfLines={1}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  notification: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)', // gray-800 with opacity
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 300,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    flexShrink: 1,
  },
});

// Hook for using WhatsApp-style bottom notifications
export const useWhatsAppBottomNotification = () => {
  const [notification, setNotification] = React.useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
    duration?: number;
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showNotification = (
    message: string,
    type: NotificationType = 'success',
    duration?: number
  ) => {
    setNotification({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  const NotificationComponent = () => (
    <SnackBar
      message={notification.message}
      type={notification.type}
      visible={notification.visible}
      onHide={hideNotification}
      duration={notification.duration}
    />
  );

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
  };
};