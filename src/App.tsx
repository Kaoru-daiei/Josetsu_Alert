import { Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { MainScreen } from "./components/MainScreen";
import { ListScreen } from "./components/ListScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { AddScreen } from "./components/AddScreen";
import "./App.css";

function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/list" element={<ListScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/add" element={<AddScreen />} />
      </Routes>
    </SettingsProvider>
  );
}

export default App;
