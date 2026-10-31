import { HashRouter, Route, Routes } from 'react-router-dom';
import { SoloHome } from './features/solo/SoloHome';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<SoloHome />} />
      </Routes>
    </HashRouter>
  );
}
