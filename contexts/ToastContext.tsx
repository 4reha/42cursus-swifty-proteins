import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text } from 'react-native';
import { ToastContextType, ToastProviderProps } from '../types/types';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: ToastProviderProps) => {
	const [toastVisible, setToastVisible] = useState(false);
	const [toastMessage, setToastMessage] = useState('');
	const toastOpacity = useRef(new Animated.Value(0)).current;
	const toastTranslateY = useRef(new Animated.Value(50)).current;
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const showToast = (message: string, duration: number = 2000) => {
		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		setToastMessage(message);
		setToastVisible(true);

		// Animate in
		Animated.parallel([
			Animated.timing(toastOpacity, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(toastTranslateY, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start();

		// Auto hide after specified duration
		timeoutRef.current = setTimeout(() => {
			hideToast();
		}, duration);
	};

	const hideToast = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		Animated.parallel([
			Animated.timing(toastOpacity, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(toastTranslateY, {
				toValue: 50,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start(() => {
			setToastVisible(false);
		});
	};

	return (
		<ToastContext.Provider value={{ showToast, hideToast }}>
			{children}

			{/* Global Toast */}
			{toastVisible && (
				<Animated.View
					style={[
						styles.toast,
						{
							opacity: toastOpacity,
							transform: [{ translateY: toastTranslateY }]
						}
					]}
				>
					<Text style={styles.toastText}>{toastMessage}</Text>
				</Animated.View>
			)}
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
	toast: {
		position: 'absolute',
		bottom: 50,
		left: 20,
		right: 20,
		backgroundColor: 'rgba(0, 0, 0, 0.85)',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		zIndex: 9999,
		maxWidth: width - 40,
		alignSelf: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 10,
	},
	toastText: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '500',
		textAlign: 'center',
		lineHeight: 20,
	},
});
