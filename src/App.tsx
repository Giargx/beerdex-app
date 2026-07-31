import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, onValue, set, get, update, push, remove } from 'firebase/database';
import { auth, db } from './firebase';

import { beers, getBeerPoints, countryCoordinates, normalizeStr, mergeBeers, getCountryFlag, formatBeerTitle } from './beers';
import type { Beer } from './beers';
import { playPopSound } from './utils/audio';
import { checkImageSafety } from './utils/imageModeration';
import { containsProfanity } from './utils/textFilter';
import { getEventMedals } from './components/TrophyGrid';

// Import Views
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { LeaderboardView } from './views/LeaderboardView';
import { PubView } from './views/PubView';
import { ProfileView } from './views/ProfileView';
import { PublicProfileView } from './views/PublicProfileView';
import { UserPostsDetailView } from './views/UserPostsDetailView';
import { FriendsView } from './views/FriendsView';
import { RulesView } from './views/RulesView';

// Import Components
import { CustomModal } from './components/CustomModal';
import { StappoOverlay } from './components/StappoOverlay';
import { AgeGateModal } from './components/AgeGateModal';
import { AuthScreen } from './components/AuthScreen';
import { ScannerModal } from './components/ScannerModal';
import { CropModal } from './components/CropModal';
import { MapContainer } from './components/MapContainer';
import { ProposeBeerModal } from './components/ProposeBeerModal';
import type { BeerProposalData } from './components/ProposeBeerModal';
import { AdminProposalsModal } from './components/AdminProposalsModal';
import type { BeerProposalItem } from './components/AdminProposalsModal';
import { UnlockRatingModal } from './components/UnlockRatingModal';
import { PermissionModal, type PermissionType, type PermissionChoice } from './components/PermissionModal';

import { FoamBubbles } from './components/FoamBubbles';

const pagesMapList = [
  'page-home',
  'page-explore',
  'page-leaderboard',
  'page-social',
  'page-profile',
  'page-friends',
  'page-rules',
  'page-public-profile',
  'page-user-posts-detail',
  'page-map-view',
];

interface Post {
  postId: string;
  user: string;
  brand: string;
  variant: string;
  photo: string;
  time: number;
  isShiny: boolean;
  isShared: boolean;
  taggedFriend: string | null;
  likes?: Record<string, boolean>;
  lat?: number;
  lng?: number;
}

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('page-home');
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [transitionDir, setTransitionDir] = useState<'left' | 'right' | null>(null);

  // User Posts Detail View State
  const [detailViewUser, setDetailViewUser] = useState<string>('');
  const [detailViewPostId, setDetailViewPostId] = useState<string>('');
  const [detailViewBackPage, setDetailViewBackPage] = useState<string>('page-profile');

  // Age Verification & Auth States
  const [ageGateOpen, setAgeGateOpen] = useState<boolean>(true);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserNick, setCurrentUserNick] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);

  // Stappo Animation
  const [stappoActive, setStappoActive] = useState<boolean>(false);
  const [stappoPopped, setStappoPopped] = useState<boolean>(false);
  const [stappoText, setStappoText] = useState<string>('STAPPO IN CORSO!');

  // Realtime Database State
  const [myPokedex, setMyPokedex] = useState<Record<string, any>>({});
  const [globalPosts, setGlobalPosts] = useState<Post[]>([]);
  const [globalLeaderboardScores, setGlobalLeaderboardScores] = useState<Record<string, number>>({});
  const [myFriendsList, setMyFriendsList] = useState<string[]>([]);
  const [myReceivedRequests, setMyReceivedRequests] = useState<string[]>([]);
  const [mySentRequests, setMySentRequests] = useState<string[]>([]);
  const [myRejectedRequests, setMyRejectedRequests] = useState<string[]>([]);
  const [globalAvatars, setGlobalAvatars] = useState<Record<string, string>>({});
  const [globalDisplayNames, setGlobalDisplayNames] = useState<Record<string, string>>({});

  // Proposal & Custom Beers State
  const [customBeers, setCustomBeers] = useState<Beer[]>([]);
  const [beerProposals, setBeerProposals] = useState<BeerProposalItem[]>([]);
  const [proposeModalOpen, setProposeModalOpen] = useState<boolean>(false);
  const [proposeBrandPrefill, setProposeBrandPrefill] = useState<string>('');
  const [proposeVariantPrefill, setProposeVariantPrefill] = useState<string>('');
  const [proposeRarityPrefill, setProposeRarityPrefill] = useState<"comune" | "media" | "rara">('comune');
  const [proposeDescPrefill, setProposeDescPrefill] = useState<string>('');

  const handleOpenProposeModal = (prefill?: { brand?: string; variant?: string; rarity?: "comune" | "media" | "rara"; desc?: string } | string) => {
    if (typeof prefill === 'string') {
      setProposeBrandPrefill(prefill);
      setProposeVariantPrefill('');
      setProposeRarityPrefill('comune');
      setProposeDescPrefill('');
    } else if (prefill) {
      setProposeBrandPrefill(prefill.brand || '');
      setProposeVariantPrefill(prefill.variant || '');
      setProposeRarityPrefill(prefill.rarity || 'comune');
      setProposeDescPrefill(prefill.desc || '');
    } else {
      setProposeBrandPrefill('');
      setProposeVariantPrefill('');
      setProposeRarityPrefill('comune');
      setProposeDescPrefill('');
    }
    setProposeModalOpen(true);
  };
  const [adminProposalsModalOpen, setAdminProposalsModalOpen] = useState<boolean>(false);
  const [flaggedPosts, setFlaggedPosts] = useState<Record<string, any>>({});
  const [unlockRatingModalState, setUnlockRatingModalState] = useState<{ isOpen: boolean; brand: string; variant: string; photo?: string } | null>(null);

  const allBeersCatalog = mergeBeers(beers, customBeers);

  // Enriched settings states
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => localStorage.getItem('beerdex_sounds') !== 'no');
  const [bubblesEnabled, setBubblesEnabled] = useState<boolean>(() => localStorage.getItem('beerdex_bubbles') !== 'no');
  const [gpsEnabled, setGpsEnabled] = useState<boolean>(() => localStorage.getItem('beerdex_gps') !== 'no');


  // Zoomed Avatar State
  const [zoomedAvatarUrl, setZoomedAvatarUrl] = useState<string | null>(null);
  const longPressTimeout = useRef<number | null>(null);

  const handleAvatarPressStart = (avatarUrl: string | undefined) => {
    if (longPressTimeout.current) {
      window.clearTimeout(longPressTimeout.current);
    }
    longPressTimeout.current = window.setTimeout(() => {
      setZoomedAvatarUrl(avatarUrl || 'generic');
    }, 300); // 300ms long press delay
  };

  const handleAvatarPressEnd = () => {
    if (longPressTimeout.current) {
      window.clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const getAvatarZoomProps = (avatarUrl: string | undefined) => {
    return {
      onMouseDown: () => handleAvatarPressStart(avatarUrl),
      onTouchStart: () => {
        handleAvatarPressStart(avatarUrl);
      },
      onMouseUp: handleAvatarPressEnd,
      onTouchEnd: handleAvatarPressEnd,
      onMouseLeave: handleAvatarPressEnd,
      style: { cursor: 'zoom-in' }
    };
  };

  // Load and apply interface brewery themes
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('beerdex_theme') || 'classic';
  });

  useEffect(() => {
    localStorage.setItem('beerdex_theme', currentTheme);
    const root = document.documentElement;
    if (currentTheme === 'amber') {
      root.style.setProperty('--primary', '#D35400');
      root.style.setProperty('--primary-dark', '#A04000');
      root.style.setProperty('--accent', '#E67E22');
      root.style.setProperty('--gold', '#F39C12');
    } else if (currentTheme === 'dark') {
      root.style.setProperty('--primary', '#5C3D2E');
      root.style.setProperty('--primary-dark', '#3D2C24');
      root.style.setProperty('--accent', '#865D36');
      root.style.setProperty('--gold', '#BCA374');
    } else if (currentTheme === 'ipa') {
      root.style.setProperty('--primary', '#2D8A4E');
      root.style.setProperty('--primary-dark', '#1E5F34');
      root.style.setProperty('--accent', '#3B9E62');
      root.style.setProperty('--gold', '#D4AC0D');
    } else { // classic
      root.style.setProperty('--primary', '#FFB300');
      root.style.setProperty('--primary-dark', '#FF6F00');
      root.style.setProperty('--accent', '#E65100');
      root.style.setProperty('--gold', '#FFB300');
    }
  }, [currentTheme]);

  // UI Modals State
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    title: string;
    text: string;
    showOk: boolean;
    callback?: () => void;
  }>({ open: false, title: 'Avviso', text: '', showOk: true });

  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    text: string;
    onConfirm?: () => void;
  }>({ open: false, title: 'Conferma', text: '' });

  const [scannerConfig, setScannerConfig] = useState<{
    open: boolean;
    brand: string;
    variant: string;
  }>({ open: false, brand: '', variant: '' });

  const [captureOpen, setCaptureOpen] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [selectedTaggedFriends, setSelectedTaggedFriends] = useState<string[]>([]);
  const [pendingUploadData, setPendingUploadData] = useState<any>(null);

  // Avatar Selection & Crop State
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState<boolean>(false);
  const [cropOpen, setCropOpen] = useState<boolean>(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');

  // Settings Overlay State
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [isProfilePrivate, setIsProfilePrivate] = useState<boolean>(false);
  const [globalUserPrivacy, setGlobalUserPrivacy] = useState<Record<string, boolean>>({});
  
  // Nickname & Password Input State in settings
  const [newNickname, setNewNickname] = useState<string>('');
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

  // Public Profile View State
  const [pubProfileUser, setPubProfileUser] = useState<string>('');
  const [pubProfileDex, setPubProfileDex] = useState<Record<string, any>>({});
  const [pubProfileScore, setPubProfileScore] = useState<number>(0);
  const [pubProfileBackPage, setPubProfileBackPage] = useState<string>('page-leaderboard');

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Permission Modal State (Location & Gallery permissions)
  const [permissionModalState, setPermissionModalState] = useState<{
    isOpen: boolean;
    type: PermissionType;
    onGranted?: () => void;
  }>({ isOpen: false, type: 'location' });

  const requestPermission = (type: PermissionType, onGranted: () => void) => {
    const permKey = type === 'location' ? 'beerdex_location_permission' : 'beerdex_gallery_permission';
    const stored = localStorage.getItem(permKey);
    if (stored === 'always' || stored === 'while_using') {
      onGranted();
    } else if (stored === 'denied') {
      showAlert(
        type === 'location'
          ? 'Hai disattivato i permessi di Posizione per BeerDex nelle impostazioni del dispositivo.'
          : 'Hai disattivato i permessi per le Foto per BeerDex nelle impostazioni del dispositivo.',
        'Permesso non concesso'
      );
    } else {
      setPermissionModalState({ isOpen: true, type, onGranted });
    }
  };

  const handlePermissionChoice = (choice: PermissionChoice) => {
    const permKey = permissionModalState.type === 'location' ? 'beerdex_location_permission' : 'beerdex_gallery_permission';
    localStorage.setItem(permKey, choice);
    const callback = permissionModalState.onGranted;
    setPermissionModalState((prev) => ({ ...prev, isOpen: false }));

    if ((choice === 'always' || choice === 'while_using') && callback) {
      callback();
    }
  };



  // check age gate on mount
  useEffect(() => {
    if (localStorage.getItem('beerdex_18plus') === 'yes') {
      setAgeGateOpen(false);
    }
  }, []);

  // Adjust body padding-top dynamically based on pages that have their own custom headers and reset scroll positions
  useEffect(() => {
    const noHeaderPages = ['page-user-posts-detail', 'page-public-profile'];
    if (noHeaderPages.includes(currentPage)) {
      document.body.style.paddingTop = '0px';
    } else {
      document.body.style.paddingTop = '70px';
    }

    // Reset window, body and inner scroll container scroll positions
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const scrollables = document.querySelectorAll('.page-container-view, [style*="overflow-y: auto"], [style*="overflowY: auto"]');
    scrollables.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [currentPage]);

  // Synchronize settings form state when the drawer is toggled
  useEffect(() => {
    if (settingsOpen) {
      setNewDisplayName(globalDisplayNames[currentUserNick] || '');
      setNewNickname(currentUserNick);
    }
  }, [settingsOpen, globalDisplayNames, currentUserNick]);

  // Listen to Auth State
  useEffect(() => {
    if (ageGateOpen) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const email = user.email ? user.email.toLowerCase() : '';
        setCurrentUserEmail(email);

        // Fetch Nickname
        const nickSnap = await get(ref(db, `users_directory/${user.uid}`));
        let nickname = '';
        if (nickSnap.exists()) {
          nickname = nickSnap.val();
        } else {
          nickname = user.email ? user.email.split('@')[0] : 'Utente';
          await set(ref(db, `users_directory/${user.uid}`), nickname);
        }
        setCurrentUserNick(nickname);

        const adminNicknames = ['gargo', 'forne02', 'aviatore'];
        const isUserAdmin = email === 'barcello.luca02@gmail.com' || adminNicknames.includes((nickname || '').toLowerCase());
        setIsAdminUser(isUserAdmin);

        setAuthOpen(false);

        // Load Realtime Data
        setupRealtimeListeners(nickname);
      } else {
        setCurrentUser(null);
        setCurrentUserNick('');
        setCurrentUserEmail('');
        setIsAdminUser(false);
        setAuthOpen(true);
      }
    });

    return () => unsubscribe();
  }, [ageGateOpen]);

  // Setup app listeners
  const setupRealtimeListeners = (nickname: string) => {
    // Calibrate all scores on initial sync
    recalculateAllScores();

    // Custom Beers
    onValue(ref(db, 'custom_beers'), (snap) => {
      const list: Beer[] = [];
      if (snap.exists()) {
        const val = snap.val();
        for (const key in val) {
          list.push(val[key]);
        }
      }
      setCustomBeers(list);
    });

    // Beer Proposals
    onValue(ref(db, 'beer_proposals'), (snap) => {
      const proposalsList: BeerProposalItem[] = [];
      if (snap.exists()) {
        const val = snap.val();
        for (const key in val) {
          proposalsList.push({
            ...val[key],
            proposalId: key,
          });
        }
        proposalsList.sort((a, b) => b.timestamp - a.timestamp);
      }
      setBeerProposals(proposalsList);
    });



    // Avatars
    onValue(ref(db, 'users_avatars'), (snap) => {
      setGlobalAvatars(snap.val() || {});
    });

    // Display Names
    onValue(ref(db, 'users_display_names'), (snap) => {
      setGlobalDisplayNames(snap.val() || {});
    });

    // Flagged Posts for Admin Review
    onValue(ref(db, 'flagged_posts'), (snap) => {
      setFlaggedPosts(snap.val() || {});
    });

    // User Privacy Settings
    onValue(ref(db, 'user_privacy'), (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setGlobalUserPrivacy(data);
        if (nickname && data[nickname] !== undefined) {
          setIsProfilePrivate(data[nickname] === true);
        }
      } else {
        setGlobalUserPrivacy({});
        setIsProfilePrivate(false);
      }
    });

    // Personal Pokedex
    onValue(ref(db, `pokedex_profiles/${nickname}`), (snap) => {
      const dex = snap.val() || {};
      setMyPokedex(dex);
    });

    // Friends List
    onValue(ref(db, `users_friends/${nickname}`), (snap) => {
      setMyFriendsList(snap.exists() ? Object.keys(snap.val()) : []);
    });

    // Friend Requests Received
    onValue(ref(db, `friend_requests/${nickname}`), (snap) => {
      setMyReceivedRequests(snap.exists() ? Object.keys(snap.val()) : []);
    });

    // Friend Requests Sent
    onValue(ref(db, `friend_requests_sent/${nickname}`), (snap) => {
      setMySentRequests(snap.exists() ? Object.keys(snap.val()) : []);
    });

    // Friend Requests Rejected
    onValue(ref(db, `friend_requests_rejected/${nickname}`), (snap) => {
      setMyRejectedRequests(snap.exists() ? Object.keys(snap.val()) : []);
    });

    // Social Timeline
    onValue(ref(db, 'social_timeline'), (snap) => {
      const postsList: Post[] = [];
      if (snap.exists()) {
        snap.forEach((child) => {
          const val = child.val();
          val.postId = child.key;
          postsList.push(val);
        });
      }
      setGlobalPosts(postsList);
    });

    // Leaderboard Scores
    onValue(ref(db, 'leaderboard_scores'), (snap) => {
      setGlobalLeaderboardScores(snap.val() || {});
    });
  };

  // Score Recalculation
  const recalculateTotalScore = async (username: string) => {
    const snap = await get(ref(db, `pokedex_profiles/${username}`));
    let totalScore = 0;
    const brandUnlockCounts: Record<string, number> = {};

    // Get current custom beers snapshot for accurate score recalculation
    const customSnap = await get(ref(db, 'custom_beers'));
    const currentCustomBeers: Beer[] = [];
    if (customSnap.exists()) {
      const val = customSnap.val();
      for (const k in val) {
        currentCustomBeers.push(val[k]);
      }
    }
    const currentCatalog = mergeBeers(beers, currentCustomBeers);

    currentCatalog.forEach((b) => {
      brandUnlockCounts[b.brand] = 0;
    });

    if (snap.exists()) {
      const profileData = snap.val();
      for (const uniqueId in profileData) {
        const entry = profileData[uniqueId];
        const bName = entry.brand || uniqueId.split('-')[0];
        const vName = uniqueId.substring(bName.length + 1);
        const isShiny = entry.isShiny || false;
        const isShared = entry.isShared || false;
        totalScore += getBeerPoints(bName, vName, isShiny, isShared, currentCatalog);

        // Grant +2 Bonus Points for proposed beer if accepted!
        if (entry.proposalBonus || entry.isProposalBonus) {
          totalScore += 2;
        }

        if (brandUnlockCounts[bName] !== undefined) {
          brandUnlockCounts[bName]++;
        }
      }
    }

    currentCatalog.forEach((beer) => {
      if (beer.variants.length > 0 && brandUnlockCounts[beer.brand] === beer.variants.length) {
        totalScore += beer.variants.length * 3;
      }
    });

    // Event Medals Recalculation
    const timelineSnap = await get(ref(db, 'social_timeline'));
    const userPosts: any[] = [];
    if (timelineSnap.exists()) {
      const timelineData = timelineSnap.val();
      for (const key in timelineData) {
        const post = timelineData[key];
        if (post.user === username) {
          userPosts.push(post);
        }
      }
    }
    const eventMedals = getEventMedals(userPosts);
    eventMedals.forEach((medal) => {
      if (medal.isUnlocked) {
        totalScore += medal.points;
      }
    });

    await set(ref(db, `leaderboard_scores/${username}`), totalScore);
  };

  // Proposal Handlers
  const handleProposeBeerSubmit = async (proposalData: BeerProposalData) => {
    try {
      const newRef = push(ref(db, 'beer_proposals'));
      const proposalObj = {
        proposalId: newRef.key!,
        brand: proposalData.brand,
        variant: proposalData.variant,
        country: proposalData.country,
        regione: proposalData.regione || null,
        rarity: proposalData.rarity,
        desc: proposalData.desc || null,
        photo: proposalData.photo,
        proposedBy: currentUserNick,
        timestamp: Date.now(),
        status: 'pending',
      };
      await set(newRef, proposalObj);
      showAlert(
        `Proposta per "${proposalData.brand} - ${proposalData.variant}" inviata agli admin! Se approvata, verrà aggiunta al catalogo, la sbloccherai subito e riceverai i punti della birra + 2 Punti Bonus!`,
        'Proposta Inviata!'
      );
    } catch (err: any) {
      showAlert('Errore durante l\'invio della proposta: ' + err.message, 'Errore');
    }
  };

  const handleAcceptProposal = async (proposal: BeerProposalItem) => {
    try {
      const formattedBrand = formatBeerTitle(proposal.brand);
      const formattedVariant = formatBeerTitle(proposal.variant);

      // 1. Save new custom beer to catalog in Firebase DB
      const newCustomBeer: Beer = {
        brand: formattedBrand,
        country: proposal.country,
        flag: getCountryFlag(proposal.country),
        rarity: proposal.rarity,
        desc: proposal.desc || `Birra ${formattedBrand} (${formattedVariant})`,
        variants: [formattedVariant],
        barcodes: [],
      };
      if (proposal.regione) {
        newCustomBeer.regione = proposal.regione;
      }
      await set(ref(db, `custom_beers/${proposal.proposalId}`), newCustomBeer);

      // 2. Unlock beer for proposing user with proposalBonus: true
      const uniqueId = `${formattedBrand}-${formattedVariant}`;
      const pokedexEntry = {
        brand: formattedBrand,
        variant: formattedVariant,
        photo: proposal.photo,
        unlockedAt: Date.now(),
        isShiny: false,
        isShared: false,
        proposalBonus: true,
      };
      await set(ref(db, `pokedex_profiles/${proposal.proposedBy}/${uniqueId}`), pokedexEntry);

      // 3. Post to social timeline
      const newPostRef = push(ref(db, 'social_timeline'));
      await set(newPostRef, {
        user: proposal.proposedBy,
        brand: formattedBrand,
        variant: formattedVariant,
        photo: proposal.photo,
        time: Date.now(),
        isShiny: false,
        isShared: false,
        proposalBonus: true,
        taggedFriend: null,
      });

      // 4. Update proposal status to accepted in DB
      await update(ref(db, `beer_proposals/${proposal.proposalId}`), {
        brand: formattedBrand,
        variant: formattedVariant,
        country: proposal.country,
        regione: proposal.regione || null,
        rarity: proposal.rarity,
        desc: proposal.desc || null,
        status: 'accepted',
      });

      // 5. Recalculate score for proposing user
      await recalculateTotalScore(proposal.proposedBy);

      showAlert(
        `Proposta "${formattedBrand} - ${formattedVariant}" ACCETTATA! Nuova birra inserita nel catalogo e punti + 2 Bonus accreditati a @${proposal.proposedBy}.`,
        'Proposta Accettata!'
      );
    } catch (err: any) {
      showAlert('Errore durante l\'approvazione della proposta: ' + err.message, 'Errore');
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await update(ref(db, `beer_proposals/${proposalId}`), { status: 'rejected' });
      showAlert('Proposta rifiutata.', 'Info');
    } catch (err: any) {
      showAlert('Errore durante il rifiuto della proposta: ' + err.message, 'Errore');
    }
  };

  const handleDeleteCustomBeerCatalog = (brandName: string) => {
    if (!isAdminUser) return;

    showConfirm(
      `Sei sicuro di voler eliminare la birra/marca "${brandName}" dal catalogo custom e dal database?`,
      'Elimina Marca dal Catalogo',
      async () => {
        try {
          const snap = await get(ref(db, 'custom_beers'));
          if (snap.exists()) {
            const data = snap.val();
            const updates: Record<string, null> = {};
            Object.entries(data).forEach(([key, val]: [string, any]) => {
              if (val && val.brand && val.brand.toLowerCase() === brandName.toLowerCase()) {
                updates[`custom_beers/${key}`] = null;
              }
            });
            if (Object.keys(updates).length > 0) {
              await update(ref(db), updates);
            }
          }

          const propSnap = await get(ref(db, 'beer_proposals'));
          if (propSnap.exists()) {
            const propData = propSnap.val();
            const propUpdates: Record<string, null> = {};
            Object.entries(propData).forEach(([key, val]: [string, any]) => {
              if (val && val.brand && val.brand.toLowerCase() === brandName.toLowerCase() && val.status === 'accepted') {
                propUpdates[`beer_proposals/${key}`] = null;
              }
            });
            if (Object.keys(propUpdates).length > 0) {
              await update(ref(db), propUpdates);
            }
          }

          showAlert(`La marca "${brandName}" è stata eliminata dal catalogo con successo!`, 'Marca Eliminata');
        } catch (err: any) {
          showAlert('Errore durante l\'eliminazione della marca: ' + err.message, 'Errore');
        }
      }
    );
  };

  // Recalculate all scores to adapt existing database records
  const recalculateAllScores = async () => {
    try {
      const scoresSnap = await get(ref(db, 'leaderboard_scores'));
      if (scoresSnap.exists()) {
        const scores = scoresSnap.val();
        for (const username in scores) {
          await recalculateTotalScore(username);
        }
      }
    } catch (err) {
      console.error("Error recalculating all scores: ", err);
    }
  };

  // Helper visibility titles
  const getUserRankTitle = (score: number, unlockedCount?: number) => {
    const totalVariants = beers.reduce((acc, b) => acc + b.variants.length, 0);
    if (unlockedCount !== undefined && unlockedCount >= totalVariants) {
      return "Ægir (Divinità Norrena della Birra)";
    }
    if (score < 50) return "Novizio del Pub";
    if (score < 200) return "Apprendista Bevitore";
    if (score < 500) return "Esploratore di Luppoli";
    if (score < 1200) return "Sommelier del Bancone";
    return "Mastro Birraio";
  };

  // Navigation Logic
  const navigateTo = (pageId: string) => {
    // Close any active drawers, menus, or modals on view switch
    setSettingsOpen(false);
    setProposeModalOpen(false);
    setAdminProposalsModalOpen(false);
    setZoomedAvatarUrl(null);
    setScannerConfig((prev) => ({ ...prev, open: false, isOpen: false }));
    setCaptureOpen(false);
    setCropOpen(false);
    setShareOpen(false);
    setAvatarSelectorOpen(false);
    setUnlockRatingModalState(null);
    setAlertConfig((prev) => ({ ...prev, open: false }));
    setConfirmConfig((prev) => ({ ...prev, open: false }));
    setPermissionModalState((prev) => ({ ...prev, isOpen: false }));

    if (pageId === 'page-map-view') {
      const storedLoc = localStorage.getItem('beerdex_location_permission');
      if (!storedLoc) {
        requestPermission('location', () => {});
      }
    }

    if (pageId === currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelectorAll('.page-container-view, .page-container, .main-tab-slide').forEach((el) => {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      });
      return;
    }
    const currIdx = pagesMapList.indexOf(currentPage);
    const targetIdx = pagesMapList.indexOf(pageId);
    if (targetIdx === -1) return;

    const isForward = targetIdx > currIdx;
    setPrevPage(currentPage);
    setCurrentPage(pageId);
    setTransitionDir(isForward ? 'left' : 'right');

    sessionStorage.setItem('beerdex_currentPage', pageId);

    // Scroll to the top when page changes
    window.scrollTo({ top: 0, behavior: 'instant' });

    setTimeout(() => {
      setPrevPage(null);
      setTransitionDir(null);
    }, 400);
  };

  // Touch swipe to drag horizontally (Main tabs swipe + iOS-style Edge Swipe Back on sub-pages)
  useEffect(() => {
    const mainTabs = ['page-home', 'page-explore', 'page-leaderboard', 'page-social', 'page-profile'];
    const isMainTab = mainTabs.includes(currentPage) && !settingsOpen;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't intercept touches if modal dialogs are active
      if (
        authOpen ||
        ageGateOpen ||
        proposeModalOpen ||
        adminProposalsModalOpen ||
        scannerConfig.open ||
        captureOpen ||
        cropOpen ||
        avatarSelectorOpen ||
        alertConfig.open ||
        confirmConfig.open ||
        zoomedAvatarUrl !== null
      ) {
        touchStartX.current = 0;
        touchStartY.current = 0;
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.closest('#mapContainer') ||
        target.closest('.crop-viewport-container') ||
        target.closest('input[type="range"]') ||
        target.closest('.leaflet-container') ||
        target.closest('.no-swipe') ||
        target.closest('.leaflet-interactive')
      ) {
        touchStartX.current = 0;
        touchStartY.current = 0;
        return;
      }

      touchStartX.current = e.changedTouches[0].clientX;
      touchStartY.current = e.changedTouches[0].clientY;
      isHorizontalSwipe.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === 0) return;
      const currentX = e.changedTouches[0].clientX;
      const currentY = e.changedTouches[0].clientY;
      const rawDiffX = currentX - touchStartX.current;
      const diffY = currentY - touchStartY.current;

      const currentIndex = mainTabs.indexOf(currentPage);

      // Clamp boundary dragging:
      // On first tab (Home, index 0), do NOT allow dragging right (rawDiffX > 0)
      // On last tab (Profile, index 4), do NOT allow dragging left (rawDiffX < 0)
      let diffX = rawDiffX;
      if (isMainTab) {
        if (currentIndex === 0 && rawDiffX > 0) {
          diffX = 0;
        } else if (currentIndex === mainTabs.length - 1 && rawDiffX < 0) {
          diffX = 0;
        }
      }

      if (isHorizontalSwipe.current === null) {
        if (Math.abs(rawDiffX) < 6 && Math.abs(diffY) < 6) return;

        if (Math.abs(rawDiffX) > Math.abs(diffY)) {
          // If on a sub-page or settings drawer, ONLY allow swipe if touch started at left edge (<= 45px) moving right
          if (!isMainTab) {
            if (touchStartX.current <= 45 && rawDiffX > 0) {
              isHorizontalSwipe.current = true;
            } else {
              isHorizontalSwipe.current = false;
              touchStartX.current = 0;
              return;
            }
          } else {
            isHorizontalSwipe.current = true;
          }
        } else {
          isHorizontalSwipe.current = false;
          touchStartX.current = 0;
          return;
        }
      }

      if (isHorizontalSwipe.current && isMainTab && diffX !== 0) {
        if (e.cancelable) {
          e.preventDefault();
        }
        setIsDragging(true);
        setDragOffset(diffX);

        const container = document.querySelector('.main-tabs-slider-container') as HTMLElement;
        if (container) {
          const basePercent = -currentIndex * 20;
          container.style.transition = 'none';
          container.style.transform = `translate3d(calc(${basePercent}% + ${diffX}px), 0, 0)`;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === 0) return;
      const currentX = e.changedTouches[0].clientX;
      const currentY = e.changedTouches[0].clientY;
      const rawDiffX = currentX - touchStartX.current;
      const diffY = currentY - touchStartY.current;

      const isEdgeBack = !isMainTab && touchStartX.current <= 45 && rawDiffX > 50 && Math.abs(diffY) < 60;
      const container = document.querySelector('.main-tabs-slider-container') as HTMLElement;

      if (container) {
        container.style.transition = '';
        container.style.transform = '';
      }

      setIsDragging(false);
      setDragOffset(0);

      if (isEdgeBack) {
        // iOS-style Edge Swipe Back on sub-pages or drawers
        if (settingsOpen) {
          setSettingsOpen(false);
        } else if (currentPage === 'page-public-profile') {
          navigateTo(pubProfileBackPage || 'page-leaderboard');
        } else if (currentPage === 'page-user-posts-detail') {
          navigateTo(detailViewBackPage || 'page-profile');
        } else if (currentPage === 'page-map-view') {
          navigateTo('page-explore');
        } else if (currentPage === 'page-friends') {
          navigateTo('page-profile');
        } else if (currentPage === 'page-rules') {
          navigateTo('page-profile');
        }
      } else if (isMainTab && isHorizontalSwipe.current) {
        const threshold = window.innerWidth * 0.15; // 15% threshold for switching main tab
        const currentIndex = mainTabs.indexOf(currentPage);

        if (rawDiffX < -threshold && currentIndex < mainTabs.length - 1) {
          navigateTo(mainTabs[currentIndex + 1]);
        } else if (rawDiffX > threshold && currentIndex > 0) {
          navigateTo(mainTabs[currentIndex - 1]);
        }
      }

      touchStartX.current = 0;
      touchStartY.current = 0;
      isHorizontalSwipe.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    currentPage,
    settingsOpen,
    pubProfileBackPage,
    detailViewBackPage,
    authOpen,
    ageGateOpen,
    proposeModalOpen,
    adminProposalsModalOpen,
    scannerConfig.open,
    captureOpen,
    cropOpen,
    avatarSelectorOpen,
    alertConfig.open,
    confirmConfig.open,
    zoomedAvatarUrl,
  ]);

  // Alert and Confirm Utilities
  const showAlert = (message: string, title = 'Avviso', showOk = true, callback?: () => void) => {
    setAlertConfig({ open: true, title, text: message, showOk, callback });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, open: false }));
  };

  const showConfirm = (message: string, title: string, onConfirm: () => void) => {
    setConfirmConfig({ open: true, title, text: message, onConfirm });
  };

  // Stappo pop bottle animation helper
  const triggerStappoAnimation = (text: string, callback?: () => void) => {
    setStappoText(text);
    setStappoActive(true);
    setStappoPopped(false);

    setTimeout(() => {
      setStappoPopped(true);
      setTimeout(() => {
        setStappoActive(false);
        setStappoPopped(false);
        if (callback) callback();
      }, 1300);
    }, 600);
  };

  // Age gate confirm
  const handleConfirmAge = () => {
    localStorage.setItem('beerdex_18plus', 'yes');
    setAgeGateOpen(false);
  };

  const handleRejectAge = () => {
    window.location.href = 'https://www.google.com';
  };

  // Photo uploads and GPS verification
  const handleInitUnlock = (brand: string, variant: string) => {
    setScannerConfig({ open: true, brand, variant });
  };

  const handleScannerSuccess = (isSpinaBypass: boolean) => {
    setScannerConfig((prev) => ({ ...prev, open: false }));
    setCaptureOpen(true);
    // store bypass in states for camera callback
    setPendingUploadData({ isSpinaBypass });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCaptureOpen(false);
    showAlert("Analisi del contesto in corso...", "Sblocco", false);

    const targetBeer = beers.find((b) => b.brand === scannerConfig.brand);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const isShiny = await checkShinyStatus(lat, lng, targetBeer);
          processPhoto(file, isShiny, lat, lng);
        },
        () => {
          processPhoto(file, false, null, null);
        }
      );
    } else {
      processPhoto(file, false, null, null);
    }
  };

  const checkShinyStatus = async (lat: number, lng: number, targetBeer: any) => {
    let isShiny = false;
    if (targetBeer && countryCoordinates[targetBeer.country]) {
      const bounds = countryCoordinates[targetBeer.country];
      if (lat >= bounds.latMin && lat <= bounds.latMax && lng >= bounds.lngMin && lng <= bounds.lngMax) {
        if (targetBeer.country === 'Italia' && targetBeer.regione) {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
            const data = await res.json();
            const currentRegion = data.address.state || data.address.region || "";
            if (normalizeStr(currentRegion).includes(normalizeStr(targetBeer.regione))) {
              isShiny = true;
            }
          } catch (e) {
            console.log("Nominatim reverse geocode error:", e);
          }
        } else {
          isShiny = true;
        }
      }
    }
    return isShiny;
  };

  const processPhoto = (file: File, isShiny: boolean, lat: number | null, lng: number | null) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 750; // Risoluzione ultra-ottimizzata per leggibilità e memoria minima
        let width = img.width;
        let height = img.height;

        // Ridimensionamento proporzionale senza ritaglio (mantiene l'aspect ratio originale)
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);

          // Controlla la sicurezza dell'immagine
          checkImageSafety(compressedDataUrl).then((safety) => {
            if (!safety.isSafe) {
              hideAlert();
              showAlert(
                safety.reason || 'L\'immagine selezionata contiene contenuto non appropriato o esplicito e non può essere caricata.',
                'Foto Rifiutata'
              );
              return;
            }

            const uploadData = {
              brand: scannerConfig.brand,
              variant: scannerConfig.variant,
              isShiny,
              canvasBase64: compressedDataUrl,
              lat,
              lng,
            };

            if (myFriendsList.length > 0) {
              setPendingUploadData(uploadData);
              hideAlert();
              setShareOpen(true);
            } else {
              finalizeUpload(uploadData, null);
            }
          });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const finalizeUpload = async (uploadData: any, taggedFriendsInput: string[] | string | null) => {
    hideAlert();
    setShareOpen(false);
    
    showAlert("Caricamento sblocco in corso...", "Cloud Sync", false);
    const { brand, variant, isShiny, canvasBase64, lat, lng } = uploadData;
    const formattedBrand = formatBeerTitle(brand);
    const formattedVariant = formatBeerTitle(variant);

    let taggedFriendsList: string[] = [];
    if (Array.isArray(taggedFriendsInput)) {
      taggedFriendsList = taggedFriendsInput.filter(Boolean);
    } else if (typeof taggedFriendsInput === 'string' && taggedFriendsInput.trim() !== '') {
      taggedFriendsList = [taggedFriendsInput.trim()];
    }

    const taggedFriendStr = taggedFriendsList.length > 0 ? taggedFriendsList.join(', ') : null;
    const isShared = taggedFriendsList.length > 0;

    const uniqueId = `${formattedBrand}-${formattedVariant}`;
    const pokedexEntry = {
      photo: canvasBase64,
      isShiny,
      isShared,
      taggedFriend: taggedFriendStr,
      taggedFriends: taggedFriendsList,
      brand: formattedBrand,
      variant: formattedVariant,
    };

    try {
      await set(ref(db, `pokedex_profiles/${currentUserNick}/${uniqueId}`), pokedexEntry);
      
      const newPostRef = push(ref(db, 'social_timeline'));
      const postData: any = {
        user: currentUserNick,
        brand: formattedBrand,
        variant: formattedVariant,
        photo: canvasBase64,
        time: new Date().getTime(),
        isShiny,
        isShared,
        taggedFriend: taggedFriendStr,
        taggedFriends: taggedFriendsList,
        fakeVotes: {},
      };
      if (lat !== null && lng !== null) {
        postData.lat = lat;
        postData.lng = lng;
      }

      await set(newPostRef, postData);
      await recalculateTotalScore(currentUserNick);
      playPopSound();

      let msg = `Birra sbloccata con successo! (+${getBeerPoints(brand, variant, isShiny, isShared)} Punti)`;
      if (isShiny) msg += '\nSBLOCCO SHINY IN TRASFERTA!';
      if (isShared) msg += `\nBEVUTA CON ${taggedFriendStr?.toUpperCase()}!`;

      hideAlert();
      showAlert(msg, 'Conquistata!');

      setTimeout(() => {
        setUnlockRatingModalState({
          isOpen: true,
          brand,
          variant,
          photo: canvasBase64,
        });
      }, 800);
    } catch (err: any) {
      hideAlert();
      showAlert('Errore sblocco: ' + err.message, 'Errore di Rete');
    }
  };

  // Like operations (triggered doubletap or button clink)
  const handleToggleLike = async (postId: string, _imageContainer: HTMLElement | null) => {
    const likeRef = ref(db, `social_timeline/${postId}/likes/${currentUserNick}`);
    const snap = await get(likeRef);
    if (snap.exists()) {
      await remove(likeRef);
    } else {
      await set(likeRef, true);
    }
  };

  // Delete variant/checkin
  const handleDeleteVariant = (brand: string, variant: string, targetUser?: string) => {
    const userToEdit = targetUser || currentUserNick;
    const uniqueId = `${brand}-${variant}`;
    showConfirm(
      `Vuoi davvero eliminare lo sblocco per ${brand} - ${variant}${targetUser ? ` dell'utente ${targetUser}` : ''}?`,
      'Conferma Eliminazione',
      async () => {
        try {
          await remove(ref(db, `pokedex_profiles/${userToEdit}/${uniqueId}`));
          
          // remove matching post in community feed as well
          const timelineSnap = await get(ref(db, 'social_timeline'));
          if (timelineSnap.exists()) {
            timelineSnap.forEach((child) => {
              const p = child.val();
              if (p.user === userToEdit && p.brand === brand && p.variant === variant) {
                remove(ref(db, `social_timeline/${child.key}`));
              }
            });
          }

          await recalculateTotalScore(userToEdit);
          showAlert(`Sblocco ${targetUser ? `di ${targetUser}` : ''} eliminato con successo.`, 'Eliminato');
        } catch (err: any) {
          showAlert('Errore eliminazione: ' + err.message);
        }
      }
    );
  };

  const handleDeletePost = (postId: string, postUser: string, brand: string, variant: string) => {
    showConfirm(
      `Vuoi davvero eliminare lo sblocco di ${postUser} per ${brand} - ${variant}?`,
      'Conferma Eliminazione',
      async () => {
        try {
          const uniqueId = `${brand}-${variant}`;
          await remove(ref(db, `pokedex_profiles/${postUser}/${uniqueId}`));
          await remove(ref(db, `social_timeline/${postId}`));
          await recalculateTotalScore(postUser);
          showAlert('Post rimosso con successo.');
        } catch (err: any) {
          showAlert(err.message, 'Errore');
        }
      }
    );
  };

  // Flag post as fake
  const handleReportFakePost = (postId: string, postUser: string, brand: string, variant: string) => {
    showConfirm(
      `Sei sicuro di voler segnalare la ${brand} (${variant}) di @${postUser} come foto inappropriata o non valida?`,
      'Segnala Foto',
      async () => {
        try {
          await set(ref(db, `social_timeline/${postId}/fakeVotes/${currentUserNick}`), true);
          const snap = await get(ref(db, `social_timeline/${postId}/fakeVotes`));
          const votesCount = snap.exists() ? Object.keys(snap.val()).length : 0;

          if (votesCount >= 4) {
            // Dopo 4 segnalazioni, invia al pannello Admin per la verifica
            const postSnap = await get(ref(db, `social_timeline/${postId}`));
            await set(ref(db, `flagged_posts/${postId}`), {
              postId,
              postUser,
              brand,
              variant,
              reportCount: votesCount,
              timestamp: Date.now(),
              postData: postSnap.exists() ? postSnap.val() : null,
            });
            showAlert(
              'Questa foto ha raggiunto 4 segnalazioni ed è stata inviata agli Admin per la verifica.',
              'Segnalazione Inviata'
            );
          } else {
            showAlert(
              `Segnalazione inviata. Se il post raggiunge 4 segnalazioni verrà inviato all'Admin per la moderazione (${votesCount}/4 segnalazioni).`,
              'Grazie'
            );
          }
        } catch (err: any) {
          showAlert(err.message);
        }
      }
    );
  };

  const handleRemoveFlaggedPost = async (postId: string, postUser: string, brand: string, variant: string) => {
    try {
      const uniqueId = `${brand}-${variant}`;
      await remove(ref(db, `pokedex_profiles/${postUser}/${uniqueId}`));
      await remove(ref(db, `social_timeline/${postId}`));
      await remove(ref(db, `flagged_posts/${postId}`));
      await recalculateTotalScore(postUser);
      showAlert(`Il post di @${postUser} è stato eliminato con successo.`, 'Post Eliminato');
    } catch (err: any) {
      showAlert('Errore eliminazione post: ' + err.message);
    }
  };

  const handleDismissFlaggedPost = async (postId: string) => {
    try {
      await remove(ref(db, `flagged_posts/${postId}`));
      await remove(ref(db, `social_timeline/${postId}/fakeVotes`));
      showAlert('Segnalazione ignorata e rimossa.', 'Segnalazione Chiusa');
    } catch (err: any) {
      showAlert('Errore: ' + err.message);
    }
  };

  // Avatar Management
  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCropImageSrc(uploadEvent.target?.result as string);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    
    // reset inputs
    e.target.value = '';
  };

  const handleConfirmCrop = async (croppedBase64: string) => {
    setCropOpen(false);
    showAlert("Caricamento avatar in corso...", "Attendere", false);

    try {
      await set(ref(db, `users_avatars/${currentUserNick}`), croppedBase64);
      hideAlert();
      showAlert("Foto profilo aggiornata con successo!", "Fatto");
    } catch (err: any) {
      hideAlert();
      showAlert("Errore di caricamento: " + err.message, "Errore");
    }
  };

  const handleRateBeer = async (brand: string, variant: string, rating: number) => {
    if (!currentUserNick) return;
    try {
      const uniqueId = `${brand}-${variant}`;
      await update(ref(db, `pokedex_profiles/${currentUserNick}/${uniqueId}`), { rating });
    } catch (err) {
      console.error("Error rating beer:", err);
    }
  };

  // Public Profile View
  const handleOpenPublicProfile = async (username: string) => {
    if (username === currentUserNick) {
      navigateTo('page-profile');
      return;
    }
    setPubProfileBackPage(currentPage);
    const snap = await get(ref(db, `pokedex_profiles/${username}`));
    const dex = snap.val() || {};
    setPubProfileDex(dex);

    const scoreSnap = await get(ref(db, `leaderboard_scores/${username}`));
    const scoreVal = scoreSnap.val() || 0;
    setPubProfileScore(scoreVal);
    setPubProfileUser(username);

    navigateTo('page-public-profile');
  };

  // Friends actions
  const handleAddFriend = async (targetNick: string) => {
    if (myReceivedRequests.includes(targetNick)) {
      showAlert(
        `Esiste già una richiesta di amicizia pendente da parte di @${targetNick}! Vai nella sezione delle richieste di amicizia per accettarla.`,
        'Richiesta Pendente'
      );
      return;
    }
    if (mySentRequests.includes(targetNick)) {
      showAlert(
        `Hai già inviato una richiesta di amicizia a @${targetNick} che è in attesa di risposta.`,
        'Richiesta Già Inviata'
      );
      return;
    }
    await set(ref(db, `friend_requests/${targetNick}/${currentUserNick}`), true);
    await set(ref(db, `friend_requests_sent/${currentUserNick}/${targetNick}`), true);
  };

  const handleAcceptRequest = async (senderNick: string) => {
    await set(ref(db, `users_friends/${currentUserNick}/${senderNick}`), true);
    await set(ref(db, `users_friends/${senderNick}/${currentUserNick}`), true);
    await remove(ref(db, `friend_requests/${currentUserNick}/${senderNick}`));
    await remove(ref(db, `friend_requests_sent/${senderNick}/${currentUserNick}`));
    await remove(ref(db, `friend_requests_rejected/${currentUserNick}/${senderNick}`));
  };

  const handleRejectRequest = async (senderNick: string) => {
    await remove(ref(db, `friend_requests/${currentUserNick}/${senderNick}`));
    await remove(ref(db, `friend_requests_sent/${senderNick}/${currentUserNick}`));
    await set(ref(db, `friend_requests_rejected/${currentUserNick}/${senderNick}`), true);
  };

  const handleCancelSentRequest = async (targetNick: string) => {
    await remove(ref(db, `friend_requests/${targetNick}/${currentUserNick}`));
    await remove(ref(db, `friend_requests_sent/${currentUserNick}/${targetNick}`));
  };

  const handleRemoveFriend = (friendNick: string) => {
    showConfirm(`Vuoi davvero rimuovere ${friendNick}?`, 'Rimuovi Amico', async () => {
      await remove(ref(db, `users_friends/${currentUserNick}/${friendNick}`));
      await remove(ref(db, `users_friends/${friendNick}/${currentUserNick}`));
    });
  };

  const handleRestoreRejectedRequest = (senderNick: string) => {
    remove(ref(db, `friend_requests_rejected/${currentUserNick}/${senderNick}`));
    handleAcceptRequest(senderNick);
  };

  // Settings view operations
  const handleSaveNickname = async () => {
    const nick = newNickname.trim();
    if (nick.length < 3) {
      showAlert("Il nickname deve avere almeno 3 caratteri.");
      return;
    }
    if (nick.toLowerCase() === currentUserNick.toLowerCase()) {
      showAlert("È già il tuo nickname!");
      return;
    }
    if (containsProfanity(nick)) {
      showAlert("Il nickname contiene termini non appropriati o blasfemi. Scegli un nickname diverso.", "Nickname Non Valido");
      return;
    }

    try {
      const snap = await get(ref(db, `usernames_emails/${nick.toLowerCase()}`));
      if (snap.exists()) {
        showAlert("Questo nickname è già stato preso da un altro utente. Scegli un nickname univoco diverso!", "Nickname Già In Uso");
        return;
      }

      const dirSnap = await get(ref(db, 'users_directory'));
      if (dirSnap.exists()) {
        const dirData = dirSnap.val();
        const isTaken = Object.entries(dirData).some(([uKey, val]: [string, any]) => {
          if (uKey === auth.currentUser?.uid) return false;
          return (val || '').toString().trim().toLowerCase() === nick.toLowerCase();
        });
        if (isTaken) {
          showAlert("Questo nickname è già stato preso da un altro utente. Scegli un nickname univoco diverso!", "Nickname Già In Uso");
          return;
        }
      }

      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const updates: any = {};
      updates[`users_directory/${uid}`] = nick;
      updates[`usernames_emails/${nick.toLowerCase()}`] = currentUserEmail;
      updates[`usernames_emails/${currentUserNick.toLowerCase()}`] = null;
      updates[`leaderboard_scores/${nick}`] = globalLeaderboardScores[currentUserNick] || 0;
      updates[`leaderboard_scores/${currentUserNick}`] = null;
      
      if (Object.keys(myPokedex).length > 0) {
        updates[`pokedex_profiles/${nick}`] = myPokedex;
        updates[`pokedex_profiles/${currentUserNick}`] = null;
      }
      
      if (myFriendsList.length > 0) {
        updates[`users_friends/${nick}`] = Object.fromEntries(myFriendsList.map((f) => [f, true]));
        updates[`users_friends/${currentUserNick}`] = null;
      }
      
      myFriendsList.forEach((f) => {
        updates[`users_friends/${f}/${nick}`] = true;
        updates[`users_friends/${f}/${currentUserNick}`] = null;
      });
      
      globalPosts.forEach((p) => {
        if (p.user === currentUserNick) {
          updates[`social_timeline/${p.postId}/user`] = nick;
        }
      });

      if (globalAvatars[currentUserNick]) {
        updates[`users_avatars/${nick}`] = globalAvatars[currentUserNick];
        updates[`users_avatars/${currentUserNick}`] = null;
      }

      if (globalDisplayNames[currentUserNick]) {
        updates[`users_display_names/${nick}`] = globalDisplayNames[currentUserNick];
        updates[`users_display_names/${currentUserNick}`] = null;
      }

      await update(ref(db), updates);
      setSettingsOpen(false);
      triggerStappoAnimation("NICKNAME AGGIORNATO! RICARICA...", () => {
        window.location.reload();
      });
    } catch (e: any) {
      showAlert("Errore durante il cambio nickname: " + e.message);
    }
  };

  const handleSaveDisplayName = async () => {
    const dispName = newDisplayName.trim();
    if (dispName.length < 2) {
      showAlert("Il soprannome deve avere almeno 2 caratteri.");
      return;
    }
    if (containsProfanity(dispName)) {
      showAlert("Il nome visualizzato contiene termini non appropriati o blasfemi.", "Nome Non Valido");
      return;
    }
    try {
      await set(ref(db, `users_display_names/${currentUserNick}`), dispName);
      showAlert("Soprannome aggiornato con successo!");
    } catch (e: any) {
      showAlert("Errore durante l'aggiornamento del soprannome: " + e.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      showAlert("Compila tutti i campi richiesti per il codice di stappo.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert("I nuovi codici di stappo inseriti non coincidono.");
      return;
    }
    if (newPassword.length < 8) {
      showAlert("Il nuovo codice di stappo deve avere almeno 8 caratteri.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      showAlert("Il nuovo codice di stappo deve contenere almeno una lettera MAIUSCOLA.");
      return;
    }
    if (!/\d/.test(newPassword)) {
      showAlert("Il nuovo codice di stappo deve contenere almeno un NUMERO.");
      return;
    }
    if (!/[!?$%&]/.test(newPassword)) {
      showAlert("Il nuovo codice di stappo deve contenere almeno un carattere speciale tra ! ? $ % &");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(currentUserEmail, oldPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);

      triggerStappoAnimation("CODICE DI STAPPO AGGIORNATO!", () => {
        showAlert("Codice di stappo aggiornato con successo!");
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSettingsOpen(false);
      });
    } catch (error: any) {
      showAlert("Il vecchio codice di stappo non è corretto o errore server: " + error.message, "Errore");
    }
  };

  const handleToggleProfilePrivacy = async (newValue: boolean) => {
    try {
      setIsProfilePrivate(newValue);
      await set(ref(db, `user_privacy/${currentUserNick}`), newValue);
      showAlert(
        newValue
          ? 'Il tuo profilo è ora PRIVATO. Solo gli amici vedranno le tue foto, le tue varianti e le tue valutazioni. Le tue medaglie restano visibili a tutti.'
          : 'Il tuo profilo è ora PUBBLICO. Tutti gli utenti possono vedere il tuo profilo e la tua collezione.',
        'Privacy Aggiornata'
      );
    } catch (err: any) {
      showAlert('Errore durante l\'aggiornamento della privacy: ' + err.message, 'Errore');
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('beerdex_currentPage');
    await signOut(auth);
    window.location.reload();
  };

  const getPageClass = (pageId: string) => {
    if (pageId === currentPage) {
      if (transitionDir === 'left') return 'page-view active slide-in-right';
      if (transitionDir === 'right') return 'page-view active slide-in-left';
      return 'page-view active';
    }
    if (pageId === prevPage) {
      if (transitionDir === 'left') return 'page-view slide-out-left';
      if (transitionDir === 'right') return 'page-view slide-out-right';
    }
    return 'page-view'; // display: none
  };

  const getSliderWrapperClass = () => {
    const mainTabs = ['page-home', 'page-explore', 'page-leaderboard', 'page-social', 'page-profile'];
    const isCurrentMain = mainTabs.includes(currentPage);
    const isPrevMain = prevPage ? mainTabs.includes(prevPage) : false;

    if (isCurrentMain) {
      if (prevPage && !isPrevMain) {
        if (transitionDir === 'left') return 'main-tabs-slider-wrapper active slide-in-right';
        if (transitionDir === 'right') return 'main-tabs-slider-wrapper active slide-in-left';
      }
      return 'main-tabs-slider-wrapper active';
    }
    
    if (prevPage && isPrevMain) {
      if (transitionDir === 'left') return 'main-tabs-slider-wrapper slide-out-left';
      if (transitionDir === 'right') return 'main-tabs-slider-wrapper slide-out-right';
    }

    return 'main-tabs-slider-wrapper';
  };

  const activeIndex = (() => {
    const mainTabs = ['page-home', 'page-explore', 'page-leaderboard', 'page-social', 'page-profile'];
    const idx = mainTabs.indexOf(currentPage);
    if (idx !== -1) return idx;
    if (prevPage) {
      const prevIdx = mainTabs.indexOf(prevPage);
      if (prevIdx !== -1) return prevIdx;
    }
    return 0;
  })();

  return (
    <>
      {/* Age Restriction Gate */}
      <AgeGateModal
        isOpen={ageGateOpen}
        onConfirm={handleConfirmAge}
        onReject={handleRejectAge}
      />

      {/* Authentication screen */}
      <AuthScreen
        isOpen={authOpen}
        onAuthSuccess={(welcomeText) => triggerStappoAnimation(welcomeText)}
        showAlert={showAlert}
      />

      {/* Pop cap stappo animation overlay */}
      <StappoOverlay
        isActive={stappoActive}
        isPopped={stappoPopped}
        text={stappoText}
      />

      {/* Custom Global Alert Dialog */}
      <CustomModal
        isOpen={alertConfig.open}
        title={alertConfig.title}
        text={alertConfig.text}
        showOk={alertConfig.showOk}
        onConfirm={() => {
          hideAlert();
          if (alertConfig.callback) alertConfig.callback();
        }}
      />

      {/* Custom Global Confirm Dialog */}
      <CustomModal
        isOpen={confirmConfig.open}
        title={confirmConfig.title}
        text={confirmConfig.text}
        showOk={false}
        onConfirm={() => {
          setConfirmConfig((prev) => ({ ...prev, open: false }));
          if (confirmConfig.onConfirm) confirmConfig.onConfirm();
        }}
        onCancel={() => {
          setConfirmConfig((prev) => ({ ...prev, open: false }));
        }}
      />

      {/* QR/Barcode scanner modal */}
      <ScannerModal
        isOpen={scannerConfig.open}
        currentTargetBrand={scannerConfig.brand}
        allBeersCatalog={allBeersCatalog}
        onClose={() => setScannerConfig((prev) => ({ ...prev, open: false }))}
        onSuccess={handleScannerSuccess}
        showAlert={showAlert}
        showConfirm={showConfirm}
        hideAlert={hideAlert}
        onRedirectToPropose={(prefill) => {
          handleOpenProposeModal(prefill);
        }}
      />

      {/* Pokedex Photo upload trigger modal */}
      {captureOpen && (
        <div className="auth-modal" style={{ zIndex: 18000 }}>
          <div className="auth-container" style={{ maxWidth: '400px', width: '90%', boxSizing: 'border-box', margin: '0 auto' }}>
            <h3 style={{ marginTop: 0, color: 'var(--dark)', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#27ae60' }}>check_circle</span> Codice Approvato
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
              Ora scatta la foto per il tuo feed social. Assicurati che si veda bene la birra!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <label 
                className="btn-main" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  textAlign: 'center', 
                  padding: '14px', 
                  cursor: 'pointer',
                  margin: 0,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>photo_camera</span>
                <span>Scatta Foto (Fotocamera)</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              </label>
              <label 
                className="btn-secondary" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  textAlign: 'center', 
                  padding: '12px', 
                  cursor: 'pointer',
                  margin: 0,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>photo_library</span>
                <span>Scegli da Galleria</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <button className="btn-secondary" onClick={() => setCaptureOpen(false)} style={{ justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Friends sharing tag modal */}
      {shareOpen && (
        <div className="auth-modal" style={{ zIndex: 20000 }}>
          <div className="auth-container" style={{ maxWidth: '380px', width: '92%' }}>
            <h3 style={{ marginTop: 0, color: 'var(--dark)', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-dark)' }}>group</span> Bevuta in Compagnia
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              Sei con degli amici? Seleziona gli amici con cui stai bevendo per condividere lo sblocco!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
              {myFriendsList.map((f) => {
                const isSelected = (selectedTaggedFriends || []).includes(f);
                return (
                  <div
                    key={f}
                    onClick={() => {
                      setSelectedTaggedFriends(prev =>
                        prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
                      );
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--gray)'),
                      background: isSelected ? '#FFFBEB' : '#FAFAFC',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '14px', color: 'var(--dark)' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSelected ? 'rgba(255, 111, 0, 0.15)' : '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? 'var(--primary-dark)' : 'var(--text-muted)',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                      >
                        🍺
                      </div>
                      {f}
                    </div>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        border: '2px solid ' + (isSelected ? 'var(--primary-dark)' : '#CBD5E1'),
                        background: isSelected ? 'var(--primary)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="btn-main"
              onClick={() => {
                finalizeUpload(pendingUploadData, selectedTaggedFriends);
                setSelectedTaggedFriends([]);
              }}
              style={{ justifyContent: 'center', width: '100%', margin: '0 0 8px 0' }}
            >
              <span className="material-symbols-outlined">send</span>
              {selectedTaggedFriends.length > 0
                ? `Condividi con ${selectedTaggedFriends.length} amic${selectedTaggedFriends.length === 1 ? 'o' : 'i'}`
                : 'Condividi Sblocco'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                finalizeUpload(pendingUploadData, []);
                setSelectedTaggedFriends([]);
              }}
              style={{ justifyContent: 'center', width: '100%', margin: 0 }}
            >
              Sono solo io (Bevi da solo)
            </button>
          </div>
        </div>
      )}

      {/* Avatar selectors camera / gallery */}
      {avatarSelectorOpen && (
        <div className="auth-modal" style={{ zIndex: 20500 }}>
          <div className="auth-container" style={{ maxWidth: '320px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: 'var(--dark)', marginBottom: '20px' }}>Cambia Foto Profilo</h3>
            
            {/* hidden inputs */}
            <input
              type="file"
              id="avatarInputGallery"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarFileSelected}
            />
            <input
              type="file"
              id="avatarInputCamera"
              accept="image/*"
              capture="user"
              style={{ display: 'none' }}
              onChange={handleAvatarFileSelected}
            />

            <button
              className="btn-main"
              onClick={() => {
                setAvatarSelectorOpen(false);
                document.getElementById('avatarInputCamera')?.click();
              }}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '10px', gap: '8px' }}
            >
              <span className="material-symbols-outlined">photo_camera</span> Scatta Foto
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setAvatarSelectorOpen(false);
                document.getElementById('avatarInputGallery')?.click();
              }}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '15px', gap: '8px' }}
            >
              <span className="material-symbols-outlined">image</span> Scegli da Galleria
            </button>
            <button
              className="btn-secondary"
              onClick={() => setAvatarSelectorOpen(false)}
              style={{ width: '100%', justifyContent: 'center', background: '#f1f3f5', color: 'var(--dark)', borderColor: '#e1e8ed' }}
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Cropper viewport */}
      <CropModal
        isOpen={cropOpen}
        imageSrc={cropImageSrc}
        onCancel={() => setCropOpen(false)}
        onConfirm={handleConfirmCrop}
      />

      {/* TOP HEADER BAR */}
      {currentPage !== 'page-user-posts-detail' && currentPage !== 'page-public-profile' && (
        <div className="top-bar">
          <div className="top-bar-side">
            <button className="top-action-btn" onClick={() => navigateTo('page-map-view')} title="Mappa Sblocchi">
              <span className="material-symbols-outlined">map</span>
            </button>
          </div>
          <div className="top-bar-logo">
            <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>sports_bar</span> BeerDex
          </div>
          <div className="top-bar-side right">
            <button className="top-action-btn" onClick={() => navigateTo('page-friends')} title="Gestione Amici">
              <span className="material-symbols-outlined">group</span>
              <span
                className="top-badge"
                id="topBeerBadge"
                style={{ display: myReceivedRequests.length > 0 ? 'inline-block' : 'none' }}
              >
                !
              </span>
            </button>
            <button className="top-action-btn" onClick={() => navigateTo('page-rules')} title="Regolamento Ufficiale">
              <span className="material-symbols-outlined">description</span>
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS DRAWER OVERLAY */}
      <div className={`settings-overlay ${settingsOpen ? 'active' : ''}`} style={{ transition: 'all 0.3s ease' }}>
        <div className="settings-content" style={{ padding: '30px 20px 80px 20px' }}>
          <button className="btn-close-settings" onClick={() => setSettingsOpen(false)}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
          </button>
          <h2 style={{ marginTop: 0, color: 'var(--dark)', textAlign: 'center', fontWeight: 900, marginBottom: '25px' }}>Impostazioni</h2>
          
          <div style={{ textAlign: 'center', marginBottom: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#e0e6ed',
              border: '3px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
              position: 'relative'
            }}>
              {globalAvatars[currentUserNick] ? (
                <img src={globalAvatars[currentUserNick]} alt={currentUserNick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--text-muted)' }}>person</span>
              )}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--dark)' }} id="ddUsername">
              {globalDisplayNames[currentUserNick] || currentUserNick}
            </div>
            {globalDisplayNames[currentUserNick] && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                @{currentUserNick}
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }} id="ddEmail">
              {currentUserEmail}
            </div>
          </div>
          
          {/* CATEGORY 1: PROFILO & ACCOUNT */}
          <div className="settings-instagram-section">
            <div className="section-title">Profilo e Account</div>

            {/* Row Profilo Privato */}
            <div className="settings-row" onClick={() => handleToggleProfilePrivacy(!isProfilePrivate)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined icon" style={{ color: isProfilePrivate ? '#EF4444' : '#64748B' }}>
                  {isProfilePrivate ? 'lock' : 'lock_open'}
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div className="row-label">Profilo Privato</div>
                  <div className="row-desc">
                    {isProfilePrivate
                      ? 'Attivo: Foto e voti personali visibili solo agli amici'
                      : 'Disattivo: Profilo visibile a tutti'}
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '13px',
                  background: isProfilePrivate ? '#EF4444' : '#CBD5E1',
                  position: 'relative',
                  transition: 'background 0.25s ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: isProfilePrivate ? '22px' : '2px',
                    transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </div>
            
            {/* Row Cambia Foto Profilo */}
            <div className="settings-row" onClick={() => setAvatarSelectorOpen(true)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined icon">photo_camera</span>
                <div>
                  <div className="row-label">Foto del profilo</div>
                  <div className="row-desc">Aggiorna o scatta la foto del tuo profilo</div>
                </div>
              </div>
              <span className="material-symbols-outlined chevron">chevron_right</span>
            </div>

            {/* Row Soprannome */}
            <div className="settings-row-expanded">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span className="material-symbols-outlined icon">badge</span>
                <div>
                  <div className="row-label">Nome visualizzato</div>
                  <div className="row-desc">Il nome visibile a tutti sul tuo profilo e nei post</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Inserisci soprannome..."
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--gray)', fontSize: '13px', margin: 0 }}
                />
                <button className="btn-main" onClick={handleSaveDisplayName} style={{ marginTop: 0, padding: '8px 16px', borderRadius: '10px', fontSize: '12px', height: 'auto', justifyContent: 'center' }}>
                  Salva
                </button>
              </div>
            </div>

            {/* Row Nickname */}
            <div className="settings-row-expanded">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span className="material-symbols-outlined icon">alternate_email</span>
                <div>
                  <div className="row-label">Nickname univoco (@username)</div>
                  <div className="row-desc">L'identificativo unico per taggare e farsi trovare</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Nuovo Nickname..."
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--gray)', fontSize: '13px', margin: 0 }}
                />
                <button className="btn-main" onClick={handleSaveNickname} style={{ marginTop: 0, padding: '8px 16px', borderRadius: '10px', fontSize: '12px', background: 'var(--primary-dark)', height: 'auto', justifyContent: 'center' }}>
                  Aggiorna
                </button>
              </div>
            </div>

            {/* Row Codice di Stappo (Password) */}
            <div className="settings-row-expanded">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span className="material-symbols-outlined icon" style={{ color: 'var(--social-blue)' }}>lock</span>
                <div>
                  <div className="row-label">Codice di Stappo (Password)</div>
                  <div className="row-desc">Cambia il codice segreto del tuo account</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <input
                  type="password"
                  placeholder="Vecchio codice di stappo"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--gray)', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <input
                  type="password"
                  placeholder="Nuovo codice di stappo"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--gray)', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <input
                  type="password"
                  placeholder="Conferma nuovo codice"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--gray)', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <button className="btn-main" onClick={handleUpdatePassword} style={{ marginTop: 4, background: 'var(--social-blue)', justifyContent: 'center', width: '100%', padding: '10px' }}>
                  Aggiorna codice
                </button>
              </div>
            </div>
          </div>

          {/* CATEGORY 2: PREFERENZE DELL'APP */}
          <div className="settings-instagram-section">
            <div className="section-title">Preferenze dell'App</div>

            {/* Row Tema */}
            <div className="settings-row-expanded">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span className="material-symbols-outlined icon">palette</span>
                <div>
                  <div className="row-label">Tema dell'applicazione</div>
                  <div className="row-desc">Personalizza i colori dominanti dell'app</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', background: '#FAFAFC', padding: '10px', borderRadius: '12px', border: '1px solid var(--gray)', marginTop: '8px', justifyContent: 'center' }}>
                {[
                  { id: 'classic', color: '#FFB300', name: 'Pilsner (Classic)' },
                  { id: 'amber', color: '#D35400', name: 'Amber Ale' },
                  { id: 'dark', color: '#5C3D2E', name: 'Stout (Dark)' },
                  { id: 'ipa', color: '#2D8A4E', name: 'Pale IPA' },
                ].map((themeItem) => (
                  <button
                    key={themeItem.id}
                    onClick={() => setCurrentTheme(themeItem.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: themeItem.color,
                      border: currentTheme === themeItem.id ? '2.5px solid var(--dark)' : '1.5px solid var(--gray)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'transform 0.1s ease',
                    }}
                    title={themeItem.name}
                  >
                    {currentTheme === themeItem.id && (
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--white)', fontWeight: 'bold' }}>
                        done
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Row Suoni dello Stappo */}
            <div className="settings-row-expanded" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, paddingRight: '10px' }}>
                <div className="row-label">Suoni dello Stappo</div>
                <div className="row-desc">Riproduci effetti sonori allo sblocco delle birre.</div>
              </div>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px', flexShrink: 0 }}>
                <input 
                  type="checkbox" 
                  checked={soundEnabled} 
                  onChange={(e) => {
                    setSoundEnabled(e.target.checked);
                    localStorage.setItem('beerdex_sounds', e.target.checked ? 'yes' : 'no');
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span className="slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: soundEnabled ? 'var(--primary)' : '#cbd5e1', transition: '.3s', borderRadius: '22px' }}>
                  <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: soundEnabled ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.3s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>

            {/* Row Bollicine */}
            <div className="settings-row-expanded" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, paddingRight: '10px' }}>
                <div className="row-label">Effetto Bollicine Birra</div>
                <div className="row-desc">Mostra bollicine animate nei banner.</div>
              </div>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px', flexShrink: 0 }}>
                <input 
                  type="checkbox" 
                  checked={bubblesEnabled} 
                  onChange={(e) => {
                    setBubblesEnabled(e.target.checked);
                    localStorage.setItem('beerdex_bubbles', e.target.checked ? 'yes' : 'no');
                    window.location.reload();
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span className="slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: bubblesEnabled ? 'var(--primary)' : '#cbd5e1', transition: '.3s', borderRadius: '22px' }}>
                  <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: bubblesEnabled ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.3s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>

            {/* Row GPS */}
            <div className="settings-row-expanded" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, paddingRight: '10px' }}>
                <div className="row-label">Tracciamento Mappa (GPS)</div>
                <div className="row-desc">Salva coordinate GPS per visualizzare sblocchi sulla mappa.</div>
              </div>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px', flexShrink: 0 }}>
                <input 
                  type="checkbox" 
                  checked={gpsEnabled} 
                  onChange={(e) => {
                    setGpsEnabled(e.target.checked);
                    localStorage.setItem('beerdex_gps', e.target.checked ? 'yes' : 'no');
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span className="slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: gpsEnabled ? 'var(--primary)' : '#cbd5e1', transition: '.3s', borderRadius: '22px' }}>
                  <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: gpsEnabled ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.3s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>
          </div>

          {/* CATEGORY 3: ALTRE OPZIONI */}
          <div className="settings-instagram-section">
            <div className="section-title">Altre Opzioni</div>
            
            {/* Info row */}
            <div className="settings-row-expanded" style={{ textAlign: 'center', background: '#FAFAFC', borderBottom: '1px solid rgba(226,232,240,0.4)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                BeerDex App v3.3.0
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Progetto Pair Programming • Powered by Vision AI
              </div>
            </div>

            {/* Logout row */}
            <div className="settings-row" onClick={handleLogout} style={{ background: '#FFF5F5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined icon" style={{ color: 'var(--danger)' }}>logout</span>
                <div>
                  <div className="row-label" style={{ color: 'var(--danger)' }}>Esci dall'applicazione</div>
                  <div className="row-desc" style={{ color: '#E53E3E', opacity: 0.85 }}>Disconnetti il tuo account da questo dispositivo</div>
                </div>
              </div>
              <span className="material-symbols-outlined chevron" style={{ color: '#FEB2B2' }}>chevron_right</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER CONTENT VIEW WITH TRANSITIONS */}
      <div className="main-content">
        {/* Main Tabs Slider */}
        <div className={getSliderWrapperClass()}>
          <div
            className={`main-tabs-slider-container ${prevPage !== null || transitionDir !== null || isDragging ? 'is-transitioning' : ''}`}
            style={{
              transform: isDragging
                ? `translateX(calc(-${activeIndex * 20}% + ${dragOffset}px))`
                : `translateX(-${activeIndex * 20}%)`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Page Home */}
            <div className={`main-tab-slide ${activeIndex === 0 ? 'active' : ''}`}>
              {currentUser && (
                <HomeView
                  currentUserNick={currentUserNick}
                  currentUserDisplayName={globalDisplayNames[currentUserNick]}
                  posts={globalPosts}
                  leaderboardScores={globalLeaderboardScores}
                  onNavigate={navigateTo}
                  getUserRankTitle={getUserRankTitle}
                />
              )}
            </div>

            {/* Page Explore */}
            <div className={`main-tab-slide ${activeIndex === 1 ? 'active' : ''}`}>
              {currentUser && (
                <ExploreView
                  myPokedex={myPokedex}
                  allBeersCatalog={allBeersCatalog}
                  onInitUnlock={handleInitUnlock}
                  onDeleteVariant={handleDeleteVariant}
                  onOpenProposeModal={(search) => {
                    handleOpenProposeModal(search);
                  }}
                  onRateBeer={handleRateBeer}
                  isAdminUser={isAdminUser}
                  onDeleteCustomBeerCatalog={handleDeleteCustomBeerCatalog}
                />
              )}
            </div>

            {/* Page Leaderboard */}
            <div className={`main-tab-slide ${activeIndex === 2 ? 'active' : ''}`}>
              {currentUser && (
                <LeaderboardView
                  currentUserNick={currentUserNick}
                  leaderboardScores={globalLeaderboardScores}
                  myFriendsList={myFriendsList}
                  mySentRequests={mySentRequests}
                  myReceivedRequests={myReceivedRequests}
                  globalAvatars={globalAvatars}
                  globalDisplayNames={globalDisplayNames}
                  onAddFriend={handleAddFriend}
                  onOpenPublicProfile={handleOpenPublicProfile}
                  onNavigateToFriends={() => navigateTo('page-friends')}
                  getUserRankTitle={getUserRankTitle}
                />
              )}
            </div>

            {/* Page Social (Pub feed) */}
            <div className={`main-tab-slide ${activeIndex === 3 ? 'active' : ''}`}>
              {currentUser && (
                <PubView
                  currentUserNick={currentUserNick}
                  posts={globalPosts}
                  globalAvatars={globalAvatars}
                  globalDisplayNames={globalDisplayNames}
                  myFriendsList={myFriendsList}
                  isAdminUser={isAdminUser}
                  myPokedex={myPokedex}
                  onToggleLike={handleToggleLike}
                  onDeletePost={handleDeletePost}
                  onReportFakePost={handleReportFakePost}
                  onOpenPublicProfile={handleOpenPublicProfile}
                  getAvatarZoomProps={getAvatarZoomProps}
                />
              )}
            </div>

            {/* Page Profile */}
            <div className={`main-tab-slide ${activeIndex === 4 ? 'active' : ''}`}>
              {currentUser && (
                <ProfileView
                  currentUserNick={currentUserNick}
                  currentUserDisplayName={globalDisplayNames[currentUserNick]}
                  isAdminUser={isAdminUser}
                  myPokedex={myPokedex}
                  globalAvatars={globalAvatars}
                  leaderboardScores={globalLeaderboardScores}
                  onToggleSettings={() => {
                    setNewNickname('');
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setSettingsOpen(true);
                  }}
                  onDeleteVariant={handleDeleteVariant}
                  getUserRankTitle={getUserRankTitle}
                  getAvatarZoomProps={getAvatarZoomProps}
                  posts={globalPosts}
                  onOpenPostDetail={(uname, pid) => {
                    setDetailViewUser(uname);
                    setDetailViewPostId(pid);
                    setDetailViewBackPage('page-profile');
                    navigateTo('page-user-posts-detail');
                  }}
                  onOpenAdminProposals={() => setAdminProposalsModalOpen(true)}
                  pendingProposalsCount={beerProposals.filter((p: BeerProposalItem) => p.status === 'pending').length}
                  onRateBeer={handleRateBeer}
                  myReceivedRequests={myReceivedRequests}
                  onNavigateToFriends={() => navigateTo('page-friends')}
                />
              )}
            </div>
          </div>
        </div>

        {/* Page Public Profile */}
        <div className={getPageClass('page-public-profile')}>
          {currentPage === 'page-public-profile' || prevPage === 'page-public-profile' ? (
            <PublicProfileView
              username={pubProfileUser}
              displayName={globalDisplayNames[pubProfileUser]}
              pokedex={pubProfileDex}
              score={pubProfileScore}
              avatar={globalAvatars[pubProfileUser]}
              onBack={() => navigateTo(pubProfileBackPage)}
              getUserRankTitle={getUserRankTitle}
              getAvatarZoomProps={getAvatarZoomProps}
              posts={globalPosts}
              onOpenPostDetail={(uname, pid) => {
                setDetailViewUser(uname);
                setDetailViewPostId(pid);
                setDetailViewBackPage('page-public-profile');
                navigateTo('page-user-posts-detail');
              }}
              allBeersCatalog={allBeersCatalog}
              isAdminUser={isAdminUser}
              onDeleteVariant={handleDeleteVariant}
              isPrivate={globalUserPrivacy[pubProfileUser] === true}
              isFriend={myFriendsList.includes(pubProfileUser)}
              currentUserNick={currentUserNick}
            />
          ) : null}
        </div>

        {/* Page Map */}
        <div className={getPageClass('page-map-view')}>
          {(currentPage === 'page-map-view' || prevPage === 'page-map-view') && (
            <div id="page-map-view">
              <header className="hero">
                <FoamBubbles />
                <h1 style={{ position: 'relative', zIndex: 2 }}>Mappa Sblocchi</h1>
                <p style={{ position: 'relative', zIndex: 2 }}>Esplora il mondo e traccia i pub in cui hai conquistato le tue birre.</p>
              </header>
              <div style={{ flexGrow: 1, position: 'relative' }}>
                <MapContainer
                  currentUserNick={currentUserNick}
                  posts={globalPosts}
                  isActive={currentPage === 'page-map-view'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Page Friends Manager */}
        <div className={getPageClass('page-friends')}>
          {currentPage === 'page-friends' || prevPage === 'page-friends' ? (
            <FriendsView
              myFriendsList={myFriendsList}
              myReceivedRequests={myReceivedRequests}
              mySentRequests={mySentRequests}
              myRejectedRequests={myRejectedRequests}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onCancelSentRequest={handleCancelSentRequest}
              onRemoveFriend={handleRemoveFriend}
              onRestoreRejectedRequest={handleRestoreRejectedRequest}
              onOpenPublicProfile={handleOpenPublicProfile}
            />
          ) : null}
        </div>

        {/* Page Rules */}
        <div className={getPageClass('page-rules')}>
          {currentPage === 'page-rules' || prevPage === 'page-rules' ? <RulesView /> : null}
        </div>

        {/* Page User Posts Detail */}
        <div className={getPageClass('page-user-posts-detail')}>
          {currentPage === 'page-user-posts-detail' || prevPage === 'page-user-posts-detail' ? (
            <UserPostsDetailView
              username={detailViewUser}
              displayName={globalDisplayNames[detailViewUser]}
              avatar={globalAvatars[detailViewUser]}
              posts={globalPosts}
              currentUserNick={currentUserNick}
              onToggleLike={handleToggleLike}
              onBack={() => navigateTo(detailViewBackPage)}
              initialPostId={detailViewPostId}
              globalDisplayNames={globalDisplayNames}
              globalAvatars={globalAvatars}
              onDeletePost={handleDeletePost}
              onReportFakePost={handleReportFakePost}
              onOpenPublicProfile={handleOpenPublicProfile}
              isAdminUser={isAdminUser}
            />
          ) : null}
        </div>
      </div>

      {/* FLOATING NAVIGATION CAP BAR */}
      {currentUser && (
        <nav className="bottom-nav">
          <div
            className={`nav-item ${currentPage === 'page-home' ? 'active' : ''}`}
            onClick={() => navigateTo('page-home')}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">home</span>
            </div>
            <div className="nav-text">Home</div>
          </div>
          <div
            className={`nav-item ${currentPage === 'page-explore' || currentPage === 'page-map-view' ? 'active' : ''}`}
            onClick={() => navigateTo('page-explore')}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">search</span>
            </div>
            <div className="nav-text">Esplora</div>
          </div>
          <div
            className={`nav-item ${currentPage === 'page-leaderboard' || currentPage === 'page-public-profile' ? 'active' : ''}`}
            onClick={() => navigateTo('page-leaderboard')}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">leaderboard</span>
            </div>
            <div className="nav-text">Classifica</div>
          </div>
          <div
            className={`nav-item ${currentPage === 'page-social' ? 'active' : ''}`}
            onClick={() => navigateTo('page-social')}
          >
            <div className="nav-icon">
              <span className="material-symbols-outlined">sports_bar</span>
            </div>
            <div className="nav-text">Pub</div>
          </div>
          <div
            className={`nav-item ${currentPage === 'page-profile' || currentPage === 'page-friends' || currentPage === 'page-rules' ? 'active' : ''}`}
            onClick={() => navigateTo('page-profile')}
          >
            <div className="nav-icon" style={{ position: 'relative' }}>
              <span className="material-symbols-outlined">person</span>
              {((isAdminUser && beerProposals.filter((p: BeerProposalItem) => p.status === 'pending').length > 0) || myReceivedRequests.length > 0) && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '-1px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#FF6F00',
                    boxShadow: '0 0 6px rgba(255, 111, 0, 0.9)',
                  }}
                  title="Notifiche in sospeso"
                />
              )}
            </div>
            <div className="nav-text">Profilo</div>
          </div>
        </nav>
      )}

      {/* Zoomed Profile Avatar modal */}
      {zoomedAvatarUrl && (
        <div
          onClick={() => setZoomedAvatarUrl(null)}
          onTouchStart={() => setZoomedAvatarUrl(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            pointerEvents: 'auto',
            animation: 'fadeIn 0.2s ease-out',
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image container directly
            style={{
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
              border: '5px solid var(--white)',
              background: '#e0e6ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'zoomIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            {zoomedAvatarUrl.startsWith('data:') ? (
              <img
                src={zoomedAvatarUrl}
                alt="Zoomed Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '120px', color: 'var(--text-muted)' }} onContextMenu={(e) => e.preventDefault()}>
                person
              </span>
            )}
          </div>
        </div>
      )}

      {/* Propose Beer Modal */}
      <ProposeBeerModal
        isOpen={proposeModalOpen}
        onClose={() => setProposeModalOpen(false)}
        initialBrandSearch={proposeBrandPrefill}
        initialVariantPrefill={proposeVariantPrefill}
        initialRarityPrefill={proposeRarityPrefill}
        initialDescPrefill={proposeDescPrefill}
        allBeersCatalog={allBeersCatalog}
        onSubmitProposal={handleProposeBeerSubmit}
      />

      {/* Admin Proposals Modal */}
      <AdminProposalsModal
        isOpen={adminProposalsModalOpen}
        onClose={() => setAdminProposalsModalOpen(false)}
        proposals={beerProposals}
        onAcceptProposal={handleAcceptProposal}
        onRejectProposal={handleRejectProposal}
        globalAvatars={globalAvatars}
        globalDisplayNames={globalDisplayNames}
        flaggedPosts={flaggedPosts}
        onRemoveFlaggedPost={handleRemoveFlaggedPost}
        onDismissFlaggedPost={handleDismissFlaggedPost}
      />

      {/* Unlock Rating Modal */}
      {unlockRatingModalState && (
        <UnlockRatingModal
          isOpen={unlockRatingModalState.isOpen}
          brand={unlockRatingModalState.brand}
          variant={unlockRatingModalState.variant}
          photo={unlockRatingModalState.photo}
          onClose={() => setUnlockRatingModalState(null)}
          onRate={(rating) => {
            handleRateBeer(unlockRatingModalState.brand, unlockRatingModalState.variant, rating);
          }}
        />
      )}

      {/* Permission Modal */}
      <PermissionModal
        isOpen={permissionModalState.isOpen}
        type={permissionModalState.type}
        onChoice={handlePermissionChoice}
      />
    </>
  );
}
