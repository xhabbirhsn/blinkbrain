import { StatusBar } from 'expo-status-bar';
import { NotesListScreen } from './src/features/notes/screens/NotesListScreen';

export default function App() {
  return (
    <>
      <NotesListScreen />
      <StatusBar style="dark" />
    </>
  );
}
