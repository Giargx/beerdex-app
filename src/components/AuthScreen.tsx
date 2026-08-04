import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../firebase';
import { containsProfanity } from '../utils/textFilter';

interface AuthScreenProps {
  isOpen: boolean;
  onAuthSuccess: (welcomeText: string) => void;
  showAlert: (message: string, title?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ isOpen, onAuthSuccess, showAlert }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleResetPassword = async () => {
    const userEmail = prompt("Inserisci l'indirizzo Email per ricevere il ripristino del codice di stappo:");
    if (!userEmail) return;
    try {
      await sendPasswordResetEmail(auth, userEmail.trim());
      showAlert("Email di ripristino del codice di stappo inviata con successo!", "Controlla l'email");
    } catch (err: any) {
      showAlert(err.message, "Errore");
    }
  };

  const handleAuthSubmit = async () => {
    if (isRegisterMode) {
      const trimmedEmail = email.trim();
      const trimmedNickname = nickname.trim();

      if (!trimmedEmail || !password || !trimmedNickname) {
        showAlert("Compila tutti i campi!");
        return;
      }
      if (trimmedNickname.length < 3) {
        showAlert("Scegli un Nickname di almeno 3 caratteri!");
        return;
      }
      if (password !== confirmPassword) {
        showAlert("I due codici di stappo inseriti non coincidono. Riprova!");
        return;
      }
      if (password.length < 8) {
        showAlert("Il codice di stappo deve essere lungo almeno 8 caratteri!");
        return;
      }
      if (!/[A-Z]/.test(password)) {
        showAlert("Il codice di stappo deve contenere almeno una lettera MAIUSCOLA!");
        return;
      }
      if (!/\d/.test(password)) {
        showAlert("Il codice di stappo deve contenere almeno un NUMERO!");
        return;
      }
      if (!/[!?$%&]/.test(password)) {
        showAlert("Il codice di stappo deve contenere almeno un carattere SPECIALE tra questi: ! ? $ % &");
        return;
      }

      if (containsProfanity(trimmedNickname)) {
        showAlert("Il Nickname inserito contiene termini non appropriati o blasfemi. Scegli un nickname diverso.", "Nickname Non Valido");
        return;
      }

      try {
        // Verifica se il nickname è già in uso (case-insensitive)
        const nickSnap = await get(ref(db, `usernames_emails/${trimmedNickname.toLowerCase()}`));
        if (nickSnap.exists()) {
          showAlert("Questo nickname è già in uso da un altro utente. Scegli un nickname univoco diverso!", "Nickname Già In Uso");
          return;
        }

        // Ulteriore verifica su users_directory
        const dirSnap = await get(ref(db, 'users_directory'));
        if (dirSnap.exists()) {
          const dirData = dirSnap.val();
          const isTaken = Object.values(dirData).some(
            (val: any) => (val || '').toString().trim().toLowerCase() === trimmedNickname.toLowerCase()
          );
          if (isTaken) {
            showAlert("Questo nickname è già in uso da un altro utente. Scegli un nickname univoco diverso!", "Nickname Già In Uso");
            return;
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const uid = userCredential.user.uid;
        
        await set(ref(db, `users_directory/${uid}`), trimmedNickname);
        await set(ref(db, `usernames_emails/${trimmedNickname.toLowerCase()}`), trimmedEmail);
        await set(ref(db, `leaderboard_scores/${trimmedNickname}`), 0);
        
        onAuthSuccess("BENVENUTO! STAPPO IN CORSO...");
      } catch (err: any) {
        showAlert("Errore Registrazione: " + err.message, "Errore");
      }
    } else {
      const trimmedLoginId = loginId.trim();
      if (!trimmedLoginId || !password) {
        showAlert("Inserisci credenziali!");
        return;
      }

      try {
        if (trimmedLoginId.includes('@')) {
          await signInWithEmailAndPassword(auth, trimmedLoginId, password);
          onAuthSuccess("BENTORNATO! STAPPO IN CORSO...");
        } else {
          const snap = await get(ref(db, `usernames_emails/${trimmedLoginId.toLowerCase()}`));
          const mappedEmail = snap.val();
          if (mappedEmail) {
            await signInWithEmailAndPassword(auth, mappedEmail, password);
            onAuthSuccess("BENTORNATO! STAPPO IN CORSO...");
          } else {
            showAlert("Nickname non trovato nei nostri archivi.", "Login Fallito");
          }
        }
      } catch (err: any) {
        showAlert("Codice di stappo o credenziali errate.", "Login Fallito");
      }
    }
  };

  return (
    <div className="auth-modal" style={{ zIndex: 15000 }}>
      <div className="auth-container">
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img
            src="/pop-it-logo.png"
            alt="POP IT Logo"
            style={{
              width: '130px',
              height: 'auto',
              maxHeight: '120px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
            }}
          />
        </div>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">
            {isRegisterMode ? 'person_add' : 'login'}
          </span>
          {isRegisterMode ? 'Crea Account' : 'Accedi a POP IT'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
          {isRegisterMode
            ? "Scegli un codice di stappo sicuro (8 caratteri, 1 Maiuscola, 1 Numero, 1 Speciale tra !?$%&)"
            : "Inserisci Email o Nickname per accedere"}
        </p>

        {!isRegisterMode && (
          <input
            type="text"
            placeholder="Email o Nickname"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />
        )}

        {isRegisterMode && (
          <>
            <input
              type="text"
              placeholder="Nickname (Es. Marco89)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <input
              type="email"
              placeholder="Indirizzo Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        )}

        <div className="pwd-container">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Codice di stappo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="eye-icon material-symbols-outlined"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </div>

        {isRegisterMode && (
          <div className="pwd-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Conferma codice di stappo"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="eye-icon material-symbols-outlined"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? 'visibility_off' : 'visibility'}
            </span>
          </div>
        )}

        <button className="btn-main" onClick={handleAuthSubmit} style={{ justifyContent: 'center' }}>
          {isRegisterMode ? 'Registrati' : 'Entra nel Pub'}
        </button>

        <div style={{ marginTop: '15px' }}>
          <span
            className="auth-toggle"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
          >
            {isRegisterMode ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </span>
          <span
            className="auth-toggle"
            onClick={handleResetPassword}
            style={{ color: 'var(--text-muted)' }}
          >
            Codice di stappo dimenticato?
          </span>
        </div>
      </div>
    </div>
  );
};
