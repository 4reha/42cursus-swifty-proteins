// services/biometricService.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { BiometricCapabilities } from '@/types/types';

export class BiometricService {
	/**
	 * Check if device supports biometric authentication
	 */
	static async checkCapabilities(): Promise<BiometricCapabilities> {
		try {
			const isSupported = await LocalAuthentication.hasHardwareAsync();

			if (!isSupported) {
				return {
					isSupported: false,
					isEnrolled: false,
					biometricType: 'none',
				};
			}

			const isEnrolled = await LocalAuthentication.isEnrolledAsync();
			const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

			let biometricType = 'unknown';
			if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
				biometricType = 'face';
			} else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
				biometricType = 'fingerprint';
			} else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
				biometricType = 'iris';
			}

			return {
				isSupported,
				isEnrolled,
				biometricType,
			};
		} catch (error) {
			console.error('Error checking biometric capabilities:', error);
			return {
				isSupported: false,
				isEnrolled: false,
				biometricType: 'none',
			};
		}
	}

	/**
	 * Authenticate user with biometrics
	 */
	static async authenticate(promptMessage?: string): Promise<boolean> {
		try {
			const capabilities = await this.checkCapabilities();

			if (!capabilities.isSupported || !capabilities.isEnrolled) {
				return false;
			}

			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: promptMessage || 'Authenticate to continue',
				fallbackLabel: 'Use Password',
				cancelLabel: 'Cancel',
				disableDeviceFallback: false,
			});

			return result.success;
		} catch (error) {
			console.error('Biometric authentication error:', error);
			return false;
		}
	}

	/**
	 * Get human-readable biometric type name
	 */
	static getBiometricTypeName(type: string): string {
		const names: Record<string, string> = {
			face: Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition',
			fingerprint: Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint',
			iris: 'Iris Scanner',
			unknown: 'Biometric',
			none: 'Not Available',
		};

		return names[type] || 'Biometric';
	}

	/**
	 * Get appropriate icon name for biometric type
	 */
	static getBiometricIcon(type: string): string {
		const icons: Record<string, string> = {
			face: 'face-recognition',
			fingerprint: 'finger-print',
			iris: 'eye',
			unknown: 'lock-closed',
			none: 'lock-closed',
		};

		return icons[type] || 'lock-closed';
	}
}