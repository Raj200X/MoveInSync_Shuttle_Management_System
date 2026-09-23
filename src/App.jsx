import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BookingProvider } from './context/BookingContext';
import { AppRouter } from './router/AppRouter';
import './styles/global.css';

// Animations for toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;
document.head.appendChild(style);

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BookingProvider>
          <AppRouter />
        </BookingProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
