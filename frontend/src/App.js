import AppRoutes from './routes/AppRoutes';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import './styles/app.css';

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
