// components/DynamicIslandSnackBar.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  StatusBar
} from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';
import Constants from 'expo-constants';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface SnackBarProps {
  message: string;
  type: NotificationType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const { width: screenWidth } = Dimensions.get('window');

// Dynamic Island detection helper
const hasDynamicIsland = () => {
  if (Platform.OS !== 'ios') return false;

  const { width, height } = Dimensions.get('window');

  // Dynamic Island devices have specific screen dimensions
  // iPhone 14 Pro: 393x852, iPhone 14 Pro Max: 430x932
  // iPhone 15 Pro: 393x852, iPhone 15 Pro Max: 430x932
  // iPhone 16 Pro: 393x852, iPhone 16 Pro Max: 430x932
  const dynamicIslandDimensions = [
    { width: 393, height: 852 }, // iPhone 14/15/16 Pro
    { width: 430, height: 932 }, // iPhone 14/15/16 Pro Max
  ];

  return dynamicIslandDimensions.some(
    dim => (width === dim.width && height === dim.height) ||
      (width === dim.height && height === dim.width) // Handle rotation
  );
};

export const SnackBar: React.FC<SnackBarProps> = ({
                                                    message,
                                                    type,
                                                    visible,
                                                    onHide,
                                                    duration = 2500,
                                                  }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
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
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
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

  const getBackgroundColor = () => {
    return 'rgba(31, 41, 55, 0.95)'; // Dark background for all types
  };

  if (!visible) return null;

  const isDynamicIsland = hasDynamicIsland();

  return (
    <View style={[
      styles.overlay,
      isDynamicIsland ? styles.dynamicIslandOverlay : styles.regularOverlay
    ]}>
      <Animated.View
        style={[
          styles.notification,
          isDynamicIsland ? styles.dynamicIslandNotification : styles.regularNotification,
          {
            transform: [{ translateY }, { scale }],
            opacity,
            backgroundColor: getBackgroundColor(),
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
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  dynamicIslandOverlay: {
    top: StatusBar.currentHeight || 44, // Position near Dynamic Island
  },
  regularOverlay: {
    top: StatusBar.currentHeight || 44,
  },
  notification: {
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 300,
    backdropFilter: 'blur(20px)',
  },
  dynamicIslandNotification: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark background for Dynamic Island style
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 200,
  },
  regularNotification: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)', // gray-800 with opacity
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    flexShrink: 1,
    textAlign: 'center',
  },
});

// Hook for using Dynamic Island-style notifications
export const useDynamicIslandNotification = () => {
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