import { SafeAreaProvider } from 'react-native-safe-area-context';
import ShoppingCartScreen from './src/screens/ShoppingCartScreen';
import React from 'react'

export default function App() {
  return (
    <SafeAreaProvider style={{marginTop: 24}}>
      <ShoppingCartScreen />
    </SafeAreaProvider>
  );
}
