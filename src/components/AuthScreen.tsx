import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
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
  const [isResetMode, setIsResetMode] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  
  const [loginId, setLoginId] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetInput, setResetInput] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const code = urlParams.get('oobCode');
    if (mode === 'resetPassword' && code) {
      verifyPasswordResetCode(auth, code)
        .then(() => {
          setOobCode(code);
        })
        .catch((err) => {
          console.error("Link di reset scaduto o già usato:", err);
        });
    }
  }, []);

  if (!isOpen && !oobCode) return null;

  const handleConfirmNewPasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 8) {
      showAlert("Il codice di stappo deve essere lungo almeno 8 caratteri!");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      showAlert("Il codice di stappo deve contenere almeno una lettera MAIUSCOLA!");
      return;
    }
    if (!/\d/.test(newPassword)) {
      showAlert("Il codice di stappo deve contenere almeno un NUMERO!");
      return;
    }
    if (!/[!?$%&]/.test(newPassword)) {
      showAlert("Il codice di stappo deve contenere almeno un carattere SPECIALE tra questi: ! ? $ % &");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert("I due codici di stappo inseriti non coincidono. Riprova!");
      return;
    }

    try {
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, newPassword);
        showAlert("Il tuo codice di stappo è stato aggiornato con successo! Ora puoi accedere.", "Codice Aggiornato");
        setOobCode(null);
        setNewPassword('');
        setConfirmNewPassword('');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      let msg = err.message;
      if (err.code === 'auth/invalid-action-code') {
        msg = "Questo link di ripristino è scaduto o è già stato utilizzato. Richiedi un nuovo link di ripristino.";
      }
      showAlert(msg, "Errore Aggiornamento");
    }
  };

  const handleResetPasswordSubmit = async () => {
    const trimmedInput = resetInput.trim();
    if (!trimmedInput) {
      showAlert("Inserisci la tua Email o il tuo Nickname!");
      return;
    }

    let targetEmail = trimmedInput.toLowerCase();

    if (!trimmedInput.includes('@')) {
      if (/[.#$\[\]]/.test(trimmedInput)) {
        showAlert("Il Nickname inserito contiene caratteri non validi.", "Errore");
        return;
      }
      try {
        const snap = await get(ref(db, `usernames_emails/${trimmedInput.toLowerCase()}`));
        const mappedEmail = snap.val();
        if (mappedEmail) {
          targetEmail = mappedEmail;
        } else {
          showAlert("Nessun account trovato con questo Nickname. Inserisci l'email usata per la registrazione.", "Nickname Non Trovato");
          return;
        }
      } catch (err: any) {
        showAlert("Errore durante la ricerca del profilo: " + err.message, "Errore DB");
        return;
      }
    }

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      showAlert(
        `Email di ripristino del codice di stappo inviata a:\n${targetEmail}\n\nNota: Se non trovi la mail nella posta in arrivo, CONTROLLA LA CARTELLA SPAM / POSTA INDESIDERATA.`,
        "Controlla l'Email"
      );
      setIsResetMode(false);
      setResetInput('');
    } catch (err: any) {
      let msg = err.message;
      if (err.code === 'auth/user-not-found') {
        msg = "Nessun account trovato con questa indirizzo Email.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "L'indirizzo Email inserito non è valido.";
      }
      showAlert(msg, "Errore Ripristino");
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
      if (/[.#$\[\]]/.test(trimmedNickname)) {
        showAlert("Il Nickname non può contenere punti (.) o simboli speciali come #, $, [, ]", "Nickname Non Valido");
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
        await set(ref(db, `users_last_nickname_change/${uid}`), Date.now());
        await set(ref(db, `usernames_emails/${trimmedNickname.toLowerCase()}`), trimmedEmail);
        await set(ref(db, `leaderboard_scores/${trimmedNickname}`), 0);
        
        onAuthSuccess("BENVENUTO! STAPPO IN CORSO...");
      } catch (err: any) {
        let msg = err.message;
        if (err.code === 'auth/email-already-in-use') {
          msg = "Questa email è già registrata. Prova ad accedere col tuo codice di stappo oppure usa il recupero se lo hai dimenticato.";
        } else if (err.code === 'auth/invalid-email') {
          msg = "L'indirizzo email inserito non è valido.";
        } else if (err.code === 'auth/weak-password') {
          msg = "Il codice di stappo è troppo debole.";
        }
        showAlert(msg, "Errore Registrazione");
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
          if (/[.#$\[\]]/.test(trimmedLoginId)) {
            showAlert("Il Nickname inserito contiene caratteri non validi.", "Login Fallito");
            return;
          }
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
        let msg = "Codice di stappo o credenziali errate.";
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          msg = "Credenziali non valide. Verifica l'email o il nickname e la password.";
        }
        showAlert(msg, "Login Fallito");
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

        {oobCode ? (
          <>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">key</span>
              Nuovo Codice di Stappo
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Scegli un nuovo codice di stappo sicuro (almeno 8 caratteri, 1 Maiuscola, 1 Numero, 1 Speciale).
            </p>

            <div className="pwd-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nuovo codice di stappo"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className="eye-icon material-symbols-outlined"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </div>

            <div className="pwd-container" style={{ marginTop: '12px' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Conferma nuovo codice di stappo"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              <span
                className="eye-icon material-symbols-outlined"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'visibility_off' : 'visibility'}
              </span>
            </div>

            <button className="btn-main" onClick={handleConfirmNewPasswordSubmit} style={{ justifyContent: 'center', marginTop: '16px', marginBottom: '12px' }}>
              Salva Nuovo Codice
            </button>
          </>
        ) : isResetMode ? (
          <>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">lock_reset</span>
              Ripristino Codice
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Inserisci l'Email o il Nickname del tuo account. Ti invieremo un link per creare un nuovo codice di stappo.
            </p>

            <input
              type="text"
              placeholder="Email o Nickname"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
            />

            <button className="btn-main" onClick={handleResetPasswordSubmit} style={{ justifyContent: 'center', marginBottom: '12px' }}>
              Invia Link di Ripristino
            </button>

            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <span
                className="auth-toggle"
                onClick={() => {
                  setIsResetMode(false);
                  setResetInput('');
                }}
              >
                ← Torna al Login
              </span>
            </div>
          </>
        ) : (
          <>
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
                onClick={() => setIsResetMode(true)}
                style={{ color: 'var(--text-muted)' }}
              >
                Codice di stappo dimenticato?
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
