import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
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
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  // Real-time validation checks for Registration
  const trimmedNick = nickname.trim();
  const normalizedMail = email.trim().toLowerCase();
  
  const isNickLenValid = trimmedNick.length >= 3;
  const hasNickForbiddenChars = /[.#$\[\]/\s]/.test(trimmedNick);
  const isNickProfane = containsProfanity(trimmedNick);
  const isNickValid = isNickLenValid && !hasNickForbiddenChars && !isNickProfane;

  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedMail);

  const isPwdLenValid = password.length >= 8;
  const isPwdUpperValid = /[A-Z]/.test(password);
  const isPwdNumValid = /\d/.test(password);
  const isPwdSpecialValid = /[^A-Za-z0-9]/.test(password);
  const isPwdValid = isPwdLenValid && isPwdUpperValid && isPwdNumValid && isPwdSpecialValid;

  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;

  // Real-time validation checks for Reset New Password
  const isNewPwdLenValid = newPassword.length >= 8;
  const isNewPwdUpperValid = /[A-Z]/.test(newPassword);
  const isNewPwdNumValid = /\d/.test(newPassword);
  const isNewPwdSpecialValid = /[^A-Za-z0-9]/.test(newPassword);
  const isNewPwdValid = isNewPwdLenValid && isNewPwdUpperValid && isNewPwdNumValid && isNewPwdSpecialValid;
  const isConfirmNewValid = confirmNewPassword.length > 0 && confirmNewPassword === newPassword;

  if (!isOpen && !oobCode) return null;

  const handleConfirmNewPasswordSubmit = async () => {
    if (!isNewPwdValid) {
      showAlert("Il nuovo codice di stappo deve rispettare tutti i criteri (minimo 8 caratteri, 1 maiuscola, 1 numero e 1 speciale tra !?$%&).", "Criteri Non Rispettati");
      return;
    }
    if (!isConfirmNewValid) {
      showAlert("I due codici di stappo inseriti non coincidono. Riprova!", "Codici Differenti");
      return;
    }

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    const trimmedInput = resetInput.trim();
    if (!trimmedInput) {
      showAlert("Inserisci la tua Email o il tuo Nickname!", "Campo Richiesto");
      return;
    }

    let targetEmail = trimmedInput.toLowerCase();

    setIsLoading(true);
    if (!trimmedInput.includes('@')) {
      if (/[.#$\[\]/]/.test(trimmedInput)) {
        showAlert("Il Nickname inserito contiene caratteri non validi.", "Errore Nickname");
        setIsLoading(false);
        return;
      }
      try {
        const snap = await get(ref(db, `usernames_emails/${trimmedInput.toLowerCase()}`));
        const mappedEmail = snap.val();
        if (mappedEmail) {
          targetEmail = mappedEmail;
        } else {
          showAlert("Nessun account trovato con questo Nickname. Inserisci l'email utilizzata per la registrazione.", "Nickname Non Trovato");
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn("Errore ricerca email da nickname:", err);
        showAlert("Impossibile verificare il Nickname. Inserisci direttamente la tua email di registrazione.", "Avviso");
        setIsLoading(false);
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
      let msg = err.message || "Errore durante l'invio dell'email di ripristino.";
      if (err.code === 'auth/user-not-found') {
        msg = "Nessun account registrato con questo indirizzo Email.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "L'indirizzo Email inserito non è valido.";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "Troppe richieste consecutive. Attendi qualche minuto prima di riprovare.";
      }
      showAlert(msg, "Errore Ripristino");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitted(true);

    if (isRegisterMode) {
      // 1. Validazione Campi Registrazione
      if (!trimmedNick) {
        showAlert("Inserisci un Nickname per il tuo account!", "Campo Richiesto");
        return;
      }
      if (!isNickLenValid) {
        showAlert("Il Nickname deve contenere almeno 3 caratteri!", "Nickname Troppo Corto");
        return;
      }
      if (hasNickForbiddenChars) {
        showAlert("Il Nickname non può contenere spazi, punti (.) o simboli speciali (#, $, [, ], /)", "Caratteri Non Ammessi");
        return;
      }
      if (isNickProfane) {
        showAlert("Il Nickname inserito contiene vocaboli non appropriati o blasfemi. Scegli un nickname diverso.", "Nickname Non Valido");
        return;
      }

      if (!normalizedMail) {
        showAlert("Inserisci il tuo indirizzo Email!", "Campo Richiesto");
        return;
      }
      if (!isEmailFormatValid) {
        showAlert("L'indirizzo Email non ha un formato valido (es. nome@dominio.com)!", "Email Non Valida");
        return;
      }

      if (!password) {
        showAlert("Crea un codice di stappo per il tuo account!", "Campo Richiesto");
        return;
      }
      if (!isPwdValid) {
        showAlert(
          "Il codice di stappo non rispetta tutti i requisiti:\n• Minimo 8 caratteri\n• Almeno 1 lettera MAIUSCOLA\n• Almeno 1 NUMERO\n• Almeno 1 carattere SPECIALE o SIMBOLO (! ? @ # $ % & *)",
          "Codice Incompleto"
        );
        return;
      }

      if (!confirmPassword) {
        showAlert("Conferma il codice di stappo inserito!", "Campo Richiesto");
        return;
      }
      if (!isConfirmValid) {
        showAlert("I due codici di stappo inseriti non coincidono. Controlla e riprova!", "Codici Non Coincidenti");
        return;
      }

      setIsLoading(true);
      try {
        // 2. Controllo pre-registrazione disponibilità Nickname su usernames_emails
        let isTaken = false;
        try {
          const nickSnap = await get(ref(db, `usernames_emails/${trimmedNick.toLowerCase()}`));
          if (nickSnap.exists()) {
            isTaken = true;
          }
        } catch (dbReadErr) {
          console.warn("Verifica preventiva nickname non bloccante:", dbReadErr);
        }

        if (isTaken) {
          showAlert("Questo Nickname è già in uso da un altro utente. Scegli un nickname univoco diverso!", "Nickname Già In Uso");
          setIsLoading(false);
          return;
        }

        // 3. Creazione account Firebase Auth (da qui in poi l'utente è autenticato)
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedMail, password);
        const uid = userCredential.user.uid;
        
        // 4. Aggiorna subito il displayName nativo su Firebase Auth per evitare race conditions
        try {
          await updateProfile(userCredential.user, { displayName: trimmedNick });
        } catch (profErr) {
          console.warn("updateProfile non bloccante:", profErr);
        }

        // 5. Salvataggio directory, timestamp, mappa email e punteggio iniziale
        try {
          await Promise.all([
            set(ref(db, `users_directory/${uid}`), trimmedNick),
            set(ref(db, `users_last_nickname_change/${uid}`), Date.now()),
            set(ref(db, `usernames_emails/${trimmedNick.toLowerCase()}`), normalizedMail),
            set(ref(db, `leaderboard_scores/${trimmedNick}`), 0),
          ]);
        } catch (saveErr: any) {
          console.error("Errore salvataggio dati realtime db:", saveErr);
        }
        
        onAuthSuccess("BENVENUTO! STAPPO IN CORSO...");
      } catch (err: any) {
        console.error("Errore durante la registrazione:", err);
        let msg = err.message || "Impossibile completare la registrazione.";
        let title = "Errore Registrazione";

        if (err.code === 'auth/email-already-in-use') {
          msg = "Questa email è già registrata. Prova ad accedere o usa 'Codice di stappo dimenticato'.";
          title = "Email Già Registrata";
        } else if (err.code === 'auth/invalid-email') {
          msg = "L'indirizzo email inserito non ha un formato valido.";
          title = "Email Non Valida";
        } else if (err.code === 'auth/weak-password') {
          msg = "Il codice di stappo inserito è troppo semplice. Rispetta tutti i criteri di sicurezza.";
          title = "Codice Troppo Debole";
        } else if (err.code === 'auth/network-request-failed') {
          msg = "Problema di connessione alla rete. Verifica la connessione Internet e riprova.";
          title = "Errore di Rete";
        } else if (err.code === 'auth/too-many-requests') {
          msg = "Troppi tentativi in poco tempo. Attendi qualche minuto prima di riprovare.";
          title = "Troppe Richieste";
        } else if (err.code === 'PERMISSION_DENIED' || (err.message && err.message.toLowerCase().includes('permission'))) {
          msg = "Permesso database negato. Assicurati che le regole del Database Firebase siano configurate correttamente.";
          title = "Permesso Negato";
        }
        showAlert(msg, title);
      } finally {
        setIsLoading(false);
      }
    } else {
      // LOGIN
      const trimmedLoginId = loginId.trim();
      if (!trimmedLoginId || !password) {
        showAlert("Inserisci le tue credenziali (Email o Nickname e Codice di stappo)!", "Campi Mancanti");
        return;
      }

      setIsLoading(true);
      try {
        if (trimmedLoginId.includes('@')) {
          const normalizedLoginMail = trimmedLoginId.toLowerCase();
          await signInWithEmailAndPassword(auth, normalizedLoginMail, password);
          onAuthSuccess("BENTORNATO! STAPPO IN CORSO...");
        } else {
          if (/[.#$\[\]/]/.test(trimmedLoginId)) {
            showAlert("Il Nickname inserito contiene caratteri non validi.", "Login Fallito");
            setIsLoading(false);
            return;
          }
          let mappedEmail: string | null = null;
          try {
            const snap = await get(ref(db, `usernames_emails/${trimmedLoginId.toLowerCase()}`));
            mappedEmail = snap.val();
          } catch (err: any) {
            console.warn("Errore lettura username da database:", err);
          }

          if (mappedEmail) {
            const normalizedLoginMail = mappedEmail.toLowerCase().trim();
            await signInWithEmailAndPassword(auth, normalizedLoginMail, password);
            onAuthSuccess("BENTORNATO! STAPPO IN CORSO...");
          } else {
            showAlert("Nickname non trovato nei nostri archivi. Se ti sei registrato con un'email, prova ad accedere inserendo la tua Email.", "Login Fallito");
          }
        }
      } catch (err: any) {
        console.error("Errore login:", err);
        let msg = "Codice di stappo o credenziali errate.";
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          msg = "Credenziali non valide. Verifica l'email o il nickname e il codice di stappo.";
        } else if (err.code === 'auth/invalid-email') {
          msg = "L'indirizzo email inserito non è valido.";
        } else if (err.code === 'auth/network-request-failed') {
          msg = "Problema di connessione alla rete. Verifica la connessione Internet e riprova.";
        } else if (err.code === 'auth/too-many-requests') {
          msg = "Troppi tentativi falliti consecutivi. L'account è momentaneamente protetto. Riprova tra qualche minuto.";
        }
        showAlert(msg, "Login Fallito");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderPasswordCriteriaWidget = (pwd: string) => {
    const len = pwd.length >= 8;
    const upper = /[A-Z]/.test(pwd);
    const num = /\d/.test(pwd);
    const special = /[^A-Za-z0-9]/.test(pwd);

    return (
      <div className="auth-pwd-criteria-box">
        <div className="auth-pwd-criteria-title">
          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>verified_user</span>
          Requisiti Codice di Stappo
        </div>
        <div className="auth-pwd-criteria-grid">
          <div className={`auth-criteria-item ${len ? 'met' : ''}`}>
            <span className="material-symbols-outlined auth-criteria-icon">
              {len ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            8+ Caratteri
          </div>
          <div className={`auth-criteria-item ${upper ? 'met' : ''}`}>
            <span className="material-symbols-outlined auth-criteria-icon">
              {upper ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            1 Maiuscola (A-Z)
          </div>
          <div className={`auth-criteria-item ${num ? 'met' : ''}`}>
            <span className="material-symbols-outlined auth-criteria-icon">
              {num ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            1 Numero (0-9)
          </div>
          <div className={`auth-criteria-item ${special ? 'met' : ''}`}>
            <span className="material-symbols-outlined auth-criteria-icon">
              {special ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            1 Simbolo o Speciale (!?@#$%&*)
          </div>
        </div>
      </div>
    );
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
            }}
          />
        </div>

        {oobCode ? (
          <>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">key</span>
              Nuovo Codice di Stappo
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Scegli un nuovo codice di stappo sicuro per il tuo account.
            </p>

            <div className="auth-field-wrapper">
              <div className="auth-field-label">Nuovo Codice di Stappo</div>
              <div className="pwd-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${newPassword ? (isNewPwdValid ? 'is-valid' : 'is-invalid') : ''}`}
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
              {renderPasswordCriteriaWidget(newPassword)}
            </div>

            <div className="auth-field-wrapper" style={{ marginTop: '10px' }}>
              <div className="auth-field-label">Conferma Nuovo Codice</div>
              <div className="pwd-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`auth-input ${confirmNewPassword ? (isConfirmNewValid ? 'is-valid' : 'is-invalid') : ''}`}
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
              {confirmNewPassword && !isConfirmNewValid && (
                <div className="auth-error-hint">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cancel</span>
                  I due codici di stappo non coincidono
                </div>
              )}
              {confirmNewPassword && isConfirmNewValid && (
                <div className="auth-success-hint">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                  I codici di stappo coincidono
                </div>
              )}
            </div>

            <button 
              className="btn-main" 
              onClick={handleConfirmNewPasswordSubmit} 
              disabled={isLoading}
              style={{ justifyContent: 'center', marginTop: '16px', marginBottom: '12px' }}
            >
              {isLoading ? 'Salvataggio...' : 'Salva Nuovo Codice'}
            </button>
          </>
        ) : isResetMode ? (
          <>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">lock_reset</span>
              Ripristino Codice
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Inserisci l'Email o il Nickname del tuo account. Ti invieremo un link per creare un nuovo codice di stappo.
            </p>

            <div className="auth-field-wrapper">
              <div className="auth-field-label">Email o Nickname</div>
              <input
                type="text"
                className="auth-input"
                placeholder="Es. Marco89 o marco@gmail.com"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            <button 
              className="btn-main" 
              onClick={handleResetPasswordSubmit} 
              disabled={isLoading}
              style={{ justifyContent: 'center', marginBottom: '12px' }}
            >
              {isLoading ? 'Invio in corso...' : 'Invia Link di Ripristino'}
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
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '18px' }}>
              {isRegisterMode
                ? "Compila i campi per creare il tuo profilo birraio"
                : "Inserisci Email o Nickname per accedere al Pub"}
            </p>

            <form onSubmit={handleAuthSubmit} style={{ width: '100%' }}>
              {!isRegisterMode && (
                <>
                  <div className="auth-field-wrapper">
                    <div className="auth-field-label">Email o Nickname</div>
                    <input
                      type="text"
                      className={`auth-input ${submitted && !loginId.trim() ? 'is-invalid' : ''}`}
                      placeholder="Email o Nickname"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    {submitted && !loginId.trim() && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                        Inserisci l'email o il tuo nickname
                      </div>
                    )}
                  </div>

                  <div className="auth-field-wrapper">
                    <div className="auth-field-label">Codice di Stappo (Password)</div>
                    <div className="pwd-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`auth-input ${submitted && !password ? 'is-invalid' : ''}`}
                        placeholder="Codice di stappo"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                      <span
                        className="eye-icon material-symbols-outlined"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </div>
                    {submitted && !password && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                        Inserisci il tuo codice di stappo
                      </div>
                    )}
                  </div>
                </>
              )}

              {isRegisterMode && (
                <>
                  {/* NICKNAME FIELD */}
                  <div className="auth-field-wrapper">
                    <div className="auth-field-label">
                      <span>Nickname</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>min. 3 caratteri, senza spazi</span>
                    </div>
                    <input
                      type="text"
                      className={`auth-input ${
                        nickname
                          ? isNickValid
                            ? 'is-valid'
                            : 'is-invalid'
                          : submitted
                          ? 'is-invalid'
                          : ''
                      }`}
                      placeholder="Es. Marco89"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    {/* Inline Validation Hints for Nickname */}
                    {nickname && !isNickLenValid && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                        Il Nickname deve avere almeno 3 caratteri ({trimmedNick.length}/3)
                      </div>
                    )}
                    {nickname && hasNickForbiddenChars && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cancel</span>
                        Non usare spazi, punti (.), barre (/) o simboli (#, $, [, ])
                      </div>
                    )}
                    {nickname && isNickProfane && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>block</span>
                        Nickname non consentito (linguaggio inappropriato)
                      </div>
                    )}
                    {nickname && isNickValid && (
                      <div className="auth-success-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                        Nickname valido
                      </div>
                    )}
                    {submitted && !nickname && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                        Inserisci un Nickname
                      </div>
                    )}
                  </div>

                  {/* EMAIL FIELD */}
                  <div className="auth-field-wrapper">
                    <div className="auth-field-label">
                      <span>Indirizzo Email</span>
                    </div>
                    <input
                      type="email"
                      className={`auth-input ${
                        email
                          ? isEmailFormatValid
                            ? 'is-valid'
                            : 'is-invalid'
                          : submitted
                          ? 'is-invalid'
                          : ''
                      }`}
                      placeholder="nome@esempio.it"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    {email && !isEmailFormatValid && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                        Formato email non valido (es. mario@gmail.com)
                      </div>
                    )}
                    {email && isEmailFormatValid && (
                      <div className="auth-success-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                        Email valida
                      </div>
                    )}
                    {submitted && !email && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                        Inserisci un indirizzo email
                      </div>
                    )}
                  </div>

                  {/* PASSWORD FIELD */}
                  <div className="auth-field-wrapper">
                    <div className="auth-field-label">
                      <span>Codice di Stappo (Password)</span>
                    </div>
                    <div className="pwd-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`auth-input ${
                          password
                            ? isPwdValid
                              ? 'is-valid'
                              : 'is-invalid'
                            : submitted
                            ? 'is-invalid'
                            : ''
                        }`}
                        placeholder="Crea codice di stappo"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                      <span
                        className="eye-icon material-symbols-outlined"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </div>
                    
                    {/* Live Password Criteria Checklist */}
                    {renderPasswordCriteriaWidget(password)}

                    {submitted && !password && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                        Inserisci un codice di stappo
                      </div>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD FIELD */}
                  <div className="auth-field-wrapper">
                    <div className="auth-field-label">
                      <span>Conferma Codice di Stappo</span>
                    </div>
                    <div className="pwd-container">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`auth-input ${
                          confirmPassword
                            ? isConfirmValid
                              ? 'is-valid'
                              : 'is-invalid'
                            : submitted
                            ? 'is-invalid'
                            : ''
                        }`}
                        placeholder="Ripeti codice di stappo"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                      <span
                        className="eye-icon material-symbols-outlined"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </div>
                    {confirmPassword && !isConfirmValid && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cancel</span>
                        I codici di stappo non coincidono
                      </div>
                    )}
                    {confirmPassword && isConfirmValid && (
                      <div className="auth-success-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                        I codici di stappo coincidono
                      </div>
                    )}
                    {submitted && !confirmPassword && (
                      <div className="auth-error-hint">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                        Conferma il tuo codice di stappo
                      </div>
                    )}
                  </div>
                </>
              )}

              <button 
                type="submit"
                className="btn-main" 
                disabled={isLoading}
                style={{ justifyContent: 'center', marginTop: '10px' }}
              >
                {isLoading 
                  ? 'Operazione in corso...' 
                  : isRegisterMode 
                  ? 'Registrati' 
                  : 'Entra nel Pub'}
              </button>
            </form>

            <div style={{ marginTop: '15px' }}>
              <span
                className="auth-toggle"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setSubmitted(false);
                }}
              >
                {isRegisterMode ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
              </span>
              <span
                className="auth-toggle"
                onClick={() => {
                  setIsResetMode(true);
                  setSubmitted(false);
                }}
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

