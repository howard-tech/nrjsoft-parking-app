/**
 * @format
 */

import { AppRegistry } from 'react-native';
import '@react-native-firebase/app';
import App from './src/App';
import { name as appName } from './app.json';
import { notificationService } from './src/services/notifications/notificationService';

notificationService.setBackgroundHandler(async () => Promise.resolve());

AppRegistry.registerComponent(appName, () => App);
