import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, logout, loginWithGoogle } from './firebase';
import { UserProfile } from './types';
import { Toaster, toast } from 'sonner';
import { Home, PlusSquare, LayoutDashboard, LogIn, LogOut, Search, MapPin, Building2, LandPlot, Menu, X, Share2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import HomePage from './pages/HomePage';
import PropertyDetails from './pages/PropertyDetails';
import AddProperty from './pages/AddProperty';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          // Create new user profile
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'buyer', // Default role
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-paper">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-accent font-serif text-4xl"
        >
          موريتانيا عقار
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-paper text-ink selection:bg-accent selection:text-white">
        <Navbar user={user} />
        <main className="pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/property/:id" element={<PropertyDetails user={user} />} />
              <Route path="/add-property" element={<AddProperty user={user} />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}

function Navbar({ user }: { user: UserProfile | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: Home },
    ...(user ? [
      { name: 'إضافة عقار', path: '/add-property', icon: PlusSquare },
      { name: 'لوحة التحكم', path: '/dashboard', icon: LayoutDashboard },
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-paper/80 backdrop-blur-md border-b border-ink/5">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <Building2 size={20} />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight">موريتانيا عقار</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-widest uppercase transition-colors hover:text-accent ${
                location.pathname === link.path ? 'text-accent border-b border-accent' : 'text-ink/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span>خروج</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 rounded-full border border-ink/20 text-sm font-medium hover:bg-ink hover:text-white transition-all"
            >
              دخول
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-paper border-b border-ink/5 p-4 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-ink/5 transition-colors"
              >
                <link.icon size={20} className="text-accent" />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
            {!user && (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-accent text-white"
              >
                <LogIn size={20} />
                <span className="font-medium">دخول</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
