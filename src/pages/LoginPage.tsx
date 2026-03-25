import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../firebase';
import { motion } from 'motion/react';
import { Building2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('فشل تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl border border-ink/5 text-center space-y-8"
      >
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-white mx-auto shadow-xl">
          <Building2 size={40} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold tracking-tight">مرحباً بك</h1>
          <p className="text-ink/40 font-medium">سجل دخولك للوصول إلى ميزات المسوقين الحصرية</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-4 bg-ink text-white py-5 rounded-3xl font-bold text-lg hover:bg-ink/90 transition-all shadow-xl active:scale-95"
        >
          <LogIn size={24} />
          <span>الدخول عبر Google</span>
        </button>

        <p className="text-[10px] text-ink/30 uppercase tracking-widest font-bold">
          بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية
        </p>
      </motion.div>
    </div>
  );
}
