import { Router, Route } from 'wouter';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route component={NotFound} />
      </Router>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
