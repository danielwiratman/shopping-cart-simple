import { SafeAreaProvider } from 'react-native-safe-area-context';
import ShoppingCartScreen from './src/screens/ShoppingCartScreen';

export default function App() {
  return (
    <SafeAreaProvider style={{marginTop: 24}}>
      <ShoppingCartScreen />
    </SafeAreaProvider>
  );
}
