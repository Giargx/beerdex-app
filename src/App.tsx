import React, { useState, useEffect, useRef, useMemo } from 'react';
import { onAuthStateChanged, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, onValue, set, get, update, push, remove } from 'firebase/database';
import { auth, db } from './firebase';

import { beers, getBeerPoints, countryCoordinates, normalizeStr, stripStr, mergeBeers, getCountryFlag, formatBeerTitle, resolvePokedexEntryBeer, isUserParticipantInPost, getUniqueParticipantPosts } from './beers';
import type { Beer } from './beers';
import { playPopSound, playClinkSound } from './utils/audio';
import { checkImageSafety } from './utils/imageModeration';
import { containsProfanity } from './utils/textFilter';
import { calculateScoreBreakdown } from './utils/score';

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
import { AdminView } from './views/AdminView';

// Import Components
import { CustomModal } from './components/CustomModal';
import { StappoOverlay } from './components/StappoOverlay';
import { AgeGateModal } from './components/AgeGateModal';
import { AuthScreen } from './components/AuthScreen';
import { ScannerModal } from './components/ScannerModal';
import { StoryEditorModal } from './components/StoryEditorModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CropModal } from './components/CropModal';
import { MapContainer } from './components/MapContainer';
import { ProposeBeerModal } from './components/ProposeBeerModal';
import type { BeerProposalData } from './components/ProposeBeerModal';
import type { BeerProposalItem } from './components/AdminProposalsModal';
import { UnlockRatingModal } from './components/UnlockRatingModal';
import { ShareProfileModal } from './components/ShareProfileModal';
import { FriendInviteModal } from './components/FriendInviteModal';
import { PermissionModal, type PermissionType, type PermissionChoice } from './components/PermissionModal';
import { TagRequestModal, type TagRequestItem } from './components/TagRequestModal';
import { AppTutorialModal } from './components/AppTutorialModal';

import { FoamBubbles } from './components/FoamBubbles';
import { PullToRefreshHandler } from './components/PullToRefreshHandler';



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
  const [subPageBackPage, setSubPageBackPage] = useState<string>('page-home');

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
  const [allPokedexProfiles, setAllPokedexProfiles] = useState<Record<string, Record<string, any>>>({});

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

  // Admin Move Beer / Variant State
  const [adminMoveTargetUser, setAdminMoveTargetUser] = useState<string>('');
  const [adminMoveInitialOldKey, setAdminMoveInitialOldKey] = useState<string>('');

  // Share Profile & Friend Invite State
  const [shareProfileModalOpen, setShareProfileModalOpen] = useState<boolean>(false);
  const [friendInviteModal, setFriendInviteModal] = useState<{ isOpen: boolean; inviterNick: string } | null>(null);

  // 1. Detect incoming friend link query params (?friend=Username or ?invite=Username or ?addFriend=Username)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const friendParam = params.get('friend') || params.get('invite') || params.get('addFriend');
      if (friendParam) {
        const cleanInviter = friendParam.trim();
        if (cleanInviter) {
          localStorage.setItem('popit_pending_friend_invite', cleanInviter);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 2. Check pending friend invite when app loads or auth status changes
  useEffect(() => {
    const pendingInviter = localStorage.getItem('popit_pending_friend_invite');
    if (pendingInviter) {
      const cleanInviter = pendingInviter.trim();
      if (currentUserNick) {
        if (cleanInviter.toLowerCase() !== currentUserNick.toLowerCase()) {
          setFriendInviteModal({ isOpen: true, inviterNick: cleanInviter });
        } else {
          localStorage.removeItem('popit_pending_friend_invite');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        // Visitor not logged in yet! Open friend invite modal encouraging registration/login
        setFriendInviteModal({ isOpen: true, inviterNick: cleanInviter });
      }
    }
  }, [currentUserNick]);

  const handleAcceptFriendInvite = async (inviterNick: string) => {
    if (!inviterNick) return;
    try {
      if (currentUserNick) {
        await handleAddFriend(inviterNick);
        localStorage.removeItem('popit_pending_friend_invite');
        window.history.replaceState({}, document.title, window.location.pathname);
        setFriendInviteModal(null);
        showAlert(`🎉 Richiesta d'amicizia inviata con successo a @${inviterNick}!`, 'Amicizia Stretta');
      } else {
        setFriendInviteModal(null);
        setAuthOpen(true);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleOpenAdminMoveModal = (targetUser?: string, oldKey?: string) => {
    if (!isAdminUser) {
      showAlert("Operazione riservata agli Amministratori.", "Accesso Negato");
      return;
    }
    setAdminMoveTargetUser(targetUser || currentUserNick || '');
    setAdminMoveInitialOldKey(oldKey || '');
    setAdminModalTab('move_variant');
    navigateTo('page-admin');
  };

  const handleAdminMoveLoggedBeer = async (
    targetUsername: string,
    oldKey: string,
    newBrand: string,
    newVariant: string
  ) => {
    if (!isAdminUser) return;
    if (!targetUsername || !oldKey || !newBrand || !newVariant) {
      showAlert("Compila tutti i campi per effettuare lo spostamento.", "Dati Incompleti");
      return;
    }

    try {
      const canonicalB = formatBeerTitle(newBrand.trim());
      const canonicalV = formatBeerTitle(newVariant.trim());
      const newKey = `${canonicalB}-${canonicalV}`;
      const normOldKeyStr = stripStr(oldKey);
      const normOldBrandStr = stripStr(oldKey.includes('-') ? oldKey.split('-')[0] : oldKey);

      const updates: Record<string, any> = {};

      // 1. Move pokedex_profiles entry
      const pokedexSnap = await get(ref(db, `pokedex_profiles/${targetUsername}`));
      if (pokedexSnap.exists()) {
        const pData = pokedexSnap.val();
        Object.entries(pData).forEach(([entryKey, entryVal]: [string, any]) => {
          const entryBrandStr = stripStr(entryVal?.brand || (entryKey.includes('-') ? entryKey.split('-')[0] : entryKey));
          const isTargetMatch = entryKey === oldKey ||
            stripStr(entryKey) === normOldKeyStr ||
            entryBrandStr === normOldBrandStr ||
            (normOldBrandStr.includes('abbay') && entryBrandStr.includes('abbay')) ||
            (normOldBrandStr.includes('deforest') && entryBrandStr.includes('deforest'));

          if (isTargetMatch) {
            updates[`pokedex_profiles/${targetUsername}/${entryKey}`] = null;
            
            // Clean old custom proposal bonus flags if re-assigning to static catalog beer
            const { proposalBonus, isProposalBonus, ...restVal } = (entryVal || {});
            updates[`pokedex_profiles/${targetUsername}/${newKey}`] = {
              ...restVal,
              brand: canonicalB,
              variant: canonicalV,
              timestamp: restVal?.timestamp || Date.now()
            };
          }
        });
      }

      // 2. Clean custom_beers if matching old brand
      const customSnap = await get(ref(db, 'custom_beers'));
      if (customSnap.exists()) {
        const cData = customSnap.val();
        Object.entries(cData).forEach(([cId, cVal]: [string, any]) => {
          if (cVal && cVal.brand) {
            const cBrandStr = stripStr(cVal.brand);
            if (cBrandStr === normOldBrandStr || cBrandStr.includes('abbay') || cBrandStr.includes('deforest')) {
              updates[`custom_beers/${cId}`] = null;
            }
          }
        });
      }

      // 3. Move timeline posts
      const timelineSnap = await get(ref(db, 'social_timeline'));
      if (timelineSnap.exists()) {
        const tData = timelineSnap.val();
        Object.entries(tData).forEach(([postId, postVal]: [string, any]) => {
          if (postVal && postVal.user && postVal.user.toLowerCase() === targetUsername.toLowerCase()) {
            const pBrandStr = stripStr(postVal.brand);
            const isPostMatch = pBrandStr === normOldBrandStr ||
              pBrandStr.includes('abbay') ||
              pBrandStr.includes('deforest') ||
              `${formatBeerTitle(postVal.brand)}-${formatBeerTitle(postVal.variant)}` === oldKey;

            if (isPostMatch) {
              updates[`social_timeline/${postId}/brand`] = canonicalB;
              updates[`social_timeline/${postId}/variant`] = canonicalV;
            }
          }
        });
      }

      await update(ref(db), updates);
      await recalculateTotalScore(targetUsername);

      showAlert(`Foto/Bevuta di @${targetUsername} spostata con successo su "${canonicalB} (${canonicalV})"! Punteggio ricalcolato.`, "Spostamento Completato");
    } catch (err: any) {
      showAlert("Errore durante lo spostamento: " + err.message, "Errore");
    }
  };

  const [adminModalTab, setAdminModalTab] = useState<'proposals' | 'flagged' | 'users' | 'feedback' | 'move_variant'>('proposals');
  const [flaggedPosts, setFlaggedPosts] = useState<Record<string, any>>({});
  const [appFeedbacks, setAppFeedbacks] = useState<Record<string, any>>({});
  const [unlockRatingModalState, setUnlockRatingModalState] = useState<{ isOpen: boolean; brand: string; variant: string; photo?: string } | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState<boolean>(false);
  const [isStoryEditorOpen, setIsStoryEditorOpen] = useState<boolean>(false);
  const [activeStoryViewerIndex, setActiveStoryViewerIndex] = useState<number | null>(null);
  const [pubStories, setPubStories] = useState<Record<string, any>>({});

  useEffect(() => {
    const feedbackRef = ref(db, 'app_feedback');
    const unsubscribe = onValue(feedbackRef, (snap) => {
      setAppFeedbacks(snap.val() || {});
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storiesRef = ref(db, 'pub_stories');
    const unsubscribe = onValue(storiesRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setPubStories(data);

        // Automatic cleanup of expired stories (>24h) from Firebase RTDB
        const now = Date.now();
        const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
        const updatesToDelete: Record<string, null> = {};

        if (data && typeof data === 'object') {
          Object.entries(data).forEach(([key, val]: [string, any]) => {
            if (val && typeof val === 'object') {
              if (val.user || val.photo || val.mediaUrl) {
                const storyTime = val.time || val.timestamp;
                if (storyTime && now - storyTime > TWENTY_FOUR_HOURS_MS) {
                  updatesToDelete[`pub_stories/${key}`] = null;
                }
              } else {
                Object.entries(val).forEach(([subKey, subVal]: [string, any]) => {
                  if (subVal && typeof subVal === 'object') {
                    const storyTime = subVal.time || subVal.timestamp;
                    if (storyTime && now - storyTime > TWENTY_FOUR_HOURS_MS) {
                      updatesToDelete[`pub_stories/${key}/${subKey}`] = null;
                    }
                  }
                });
              }
            }
          });
        }

        if (Object.keys(updatesToDelete).length > 0) {
          update(ref(db), updatesToDelete).catch((err) => {
            console.error("Error auto-cleaning expired stories:", err);
          });
        }
      } else {
        setPubStories({});
      }
    });
    return () => unsubscribe();
  }, []);

  const [storyViewerQueue, setStoryViewerQueue] = useState<any[]>([]);

  const activePubStories = useMemo(() => {
    const storiesList: any[] = [];
    const seenStoryIds = new Set<string>();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const parseAndAddStory = (key: string, val: any) => {
      if (!val || typeof val !== 'object') return;
      const media = val.mediaUrl || val.photo;
      if (!media) return;

      const storyTime = val.time || val.timestamp || Date.now();
      // Only include stories created within the last 24 hours
      if (now - storyTime > TWENTY_FOUR_HOURS_MS) return;

      if (!seenStoryIds.has(key)) {
        seenStoryIds.add(key);
        storiesList.push({
          postId: key,
          brand: 'Storia del Pub',
          variant: 'Foto al volo',
          isStory: true,
          ...val,
          photo: media,
          mediaUrl: media,
          time: storyTime,
        });
      }
    };

    if (pubStories && typeof pubStories === 'object') {
      Object.entries(pubStories).forEach(([key, val]) => {
        if (val && typeof val === 'object') {
          if (val.user || val.photo || val.mediaUrl) {
            parseAndAddStory(key, val);
          } else {
            Object.entries(val).forEach(([subKey, subVal]) => {
              parseAndAddStory(subKey, subVal);
            });
          }
        }
      });
    }

    (globalPosts || []).forEach((p: any) => {
      if (p && (p.isStory || p.brand === 'Storia del Pub') && (p.photo || p.mediaUrl)) {
        parseAndAddStory(p.postId, p);
      }
    });

    // PRIVACY FILTER: Solo le storie dell'utente loggato o dei suoi amici!
    const currentUserLower = (currentUserNick || '').toLowerCase();
    const friendsSet = new Set((myFriendsList || []).map((f) => (f || '').toLowerCase()));

    const filteredStories = storiesList.filter((s) => {
      if (!s || !s.user) return false;
      const uLower = s.user.toLowerCase();
      return uLower === currentUserLower || friendsSet.has(uLower);
    });

    // Group stories by user and sort each user's stories ASCENDING (oldest first, newest last)
    const storiesByUser: Record<string, any[]> = {};
    filteredStories.forEach((s) => {
      const uKey = (s.user || 'anonimo').toLowerCase();
      if (!storiesByUser[uKey]) storiesByUser[uKey] = [];
      storiesByUser[uKey].push(s);
    });

    Object.keys(storiesByUser).forEach((u) => {
      storiesByUser[u].sort((a, b) => (a.time || 0) - (b.time || 0));
    });

    return { storiesByUser, rawList: filteredStories };
  }, [pubStories, globalPosts, currentUserNick, myFriendsList]);

  const handleOpenUserStory = (username: string): boolean => {
    const targetLower = (username || '').toLowerCase();
    
    // Find matching user key in activePubStories
    const targetUserKey = Object.keys(activePubStories.storiesByUser).find(
      (u) => u.toLowerCase() === targetLower
    );
    let targetStories = targetUserKey ? activePubStories.storiesByUser[targetUserKey] : [];

    // Fallback if current user clicked own profile and has stories under different casing or raw list
    if (targetStories.length === 0 && targetLower === (currentUserNick || '').toLowerCase()) {
      const myRaw = activePubStories.rawList.filter(
        (s) => (s.user || '').toLowerCase() === targetLower
      );
      if (myRaw.length > 0) {
        targetStories = myRaw;
      }
    }

    if (targetStories.length > 0) {
      // Sort target user's stories ASCENDING (oldest 21h ago first, newest 5m ago last)
      const sortedTargetStories = [...targetStories].sort((a, b) => (a.time || 0) - (b.time || 0));

      // Get other users who have active stories
      const otherUserKeys = Object.keys(activePubStories.storiesByUser).filter(
        (u) => u.toLowerCase() !== targetLower
      );

      // Sort other users by the timestamp of their earliest story ASCENDING (oldest user story first)
      otherUserKeys.sort((u1, u2) => {
        const u1Earliest = activePubStories.storiesByUser[u1][0]?.time || 0;
        const u2Earliest = activePubStories.storiesByUser[u2][0]?.time || 0;
        return u1Earliest - u2Earliest;
      });

      const combinedQueue = [...sortedTargetStories];
      otherUserKeys.forEach((u) => {
        const userSortedStories = [...activePubStories.storiesByUser[u]].sort(
          (a, b) => (a.time || 0) - (b.time || 0)
        );
        combinedQueue.push(...userSortedStories);
      });

      setStoryViewerQueue(combinedQueue);
      setActiveStoryViewerIndex(0);
      return true;
    }

    return false;
  };

  const handleDeleteStory = async (postId: string) => {
    try {
      await remove(ref(db, `pub_stories/main_pub/${postId}`));
      await remove(ref(db, `pub_stories/${postId}`));
      await remove(ref(db, `posts/${postId}`));

      setGlobalPosts((prev) => prev.filter((p) => p.postId !== postId));
      setStoryViewerQueue((prev) => prev.filter((s) => s.postId !== postId));
    } catch (e) {
      console.error("Error deleting story:", e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const hasSeen = localStorage.getItem('beerdex_tutorial_seen_v1');
      if (!hasSeen) {
        setTutorialOpen(true);
      }
    }
  }, [currentUser]);

  const handleCloseTutorial = () => {
    localStorage.setItem('beerdex_tutorial_seen_v1', 'true');
    setTutorialOpen(false);
  };

  const allBeersCatalog = mergeBeers(beers, customBeers);

  // Enriched settings states
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('beerdex_sounds') !== 'no'; } catch { return true; }
  });
  const [bubblesEnabled, setBubblesEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('beerdex_bubbles') !== 'no'; } catch { return true; }
  });
  const [gpsEnabled, setGpsEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('beerdex_gps') !== 'no'; } catch { return true; }
  });


  // Zoomed Avatar State
  const [zoomedAvatarUrl, setZoomedAvatarUrl] = useState<string | null>(null);
  const longPressTimeout = useRef<any>(null);
  const isLongPressActive = useRef<boolean>(false);
  const zoomOpenedAt = useRef<number>(0);

  const handleAvatarPressStart = (avatarUrl: string | undefined) => {
    isLongPressActive.current = false;
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    longPressTimeout.current = setTimeout(() => {
      isLongPressActive.current = true;
      zoomOpenedAt.current = Date.now();
      setZoomedAvatarUrl(avatarUrl || 'generic');
    }, 350); // 350ms long press delay
  };

  const handleAvatarPressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const getAvatarZoomProps = (avatarUrl: string | undefined, onClickFallback?: (e?: any) => void) => {
    return {
      onMouseDown: () => handleAvatarPressStart(avatarUrl),
      onTouchStart: () => handleAvatarPressStart(avatarUrl),
      onMouseUp: handleAvatarPressEnd,
      onTouchEnd: handleAvatarPressEnd,
      onMouseLeave: handleAvatarPressEnd,
      onClick: (e: any) => {
        if (isLongPressActive.current) {
          e?.stopPropagation?.();
          e?.preventDefault?.();
          isLongPressActive.current = false;
          return;
        }
        if (onClickFallback) onClickFallback(e);
      },
      style: { cursor: 'zoom-in' }
    };
  };

  // Load and apply interface brewery themes
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    try { return localStorage.getItem('beerdex_theme') || 'classic'; } catch { return 'classic'; }
  });

  useEffect(() => {
    try { localStorage.setItem('beerdex_theme', currentTheme); } catch {}
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
  const [exploreSearchTerm, setExploreSearchTerm] = useState<string>('');

  const handleNavigateToExplore = (brand?: string) => {
    if (brand) {
      setExploreSearchTerm(brand);
    } else {
      setExploreSearchTerm('');
    }
    navigateTo('page-explore');
  };

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
  const [storyCaptureOpen, setStoryCaptureOpen] = useState<boolean>(false);
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

  // PWA Deferred Installation Prompt State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallAppClick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('Installazione accettata dall\'utente!');
      }
      setDeferredInstallPrompt(null);
      setShowInstallBanner(false);
    } else {
      alert('📲 Come installare l\'app POP IT su Chrome:\n\n1. Tocca i tre puntini (⋮) in alto a destra su Chrome.\n2. Seleziona "Aggiungi a Schermata Home" oppure "Installa app".\n3. L\'app apparirà sul tuo dispositivo come un\'applicazione nativa!');
    }
  };
  
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



  // Main Tab Touch Swipe State & Handlers
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleMainTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleMainTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === 0) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    const mainTabs = ['page-home', 'page-explore', 'page-leaderboard', 'page-social', 'page-profile'];
    const currentIndex = mainTabs.indexOf(currentPage);

    // Prevent dragging past left edge on Home or past right edge on Profile
    if ((currentIndex === 0 && diffX > 0) || (currentIndex === mainTabs.length - 1 && diffX < 0)) {
      return;
    }

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 5 && Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(diffY) > 5) {
        isHorizontalSwipe.current = false;
      }
    }

    if (isHorizontalSwipe.current) {
      setIsDragging(true);
      setDragOffset(diffX);
    }
  };

  const handleMainTouchEnd = () => {
    if (isDragging && touchStartX.current !== 0) {
      const threshold = 18; // Ultra-sensitive 18px swipe threshold to switch tab
      const mainTabs = ['page-home', 'page-explore', 'page-leaderboard', 'page-social', 'page-profile'];
      const currentIndex = mainTabs.indexOf(currentPage);

      if (dragOffset < -threshold && currentIndex < mainTabs.length - 1) {
        navigateTo(mainTabs[currentIndex + 1]);
      } else if (dragOffset > threshold && currentIndex > 0) {
        navigateTo(mainTabs[currentIndex - 1]);
      }
    }
    touchStartX.current = 0;
    touchStartY.current = 0;
    isHorizontalSwipe.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  // iOS-style Edge Swipe Back for subpages & settings drawer
  const edgeStartX = useRef<number>(0);
  const edgeStartY = useRef<number>(0);
  const isEdgeSwiping = useRef<boolean>(false);

  useEffect(() => {
    const mainTabs = ['page-home', 'page-explore', 'page-leaderboard', 'page-social', 'page-profile'];
    const isSubPage = !mainTabs.includes(currentPage) || settingsOpen;

    if (!isSubPage) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientX <= 45) {
        edgeStartX.current = e.touches[0].clientX;
        edgeStartY.current = e.touches[0].clientY;
        isEdgeSwiping.current = false;
      } else {
        edgeStartX.current = 0;
        edgeStartY.current = 0;
        isEdgeSwiping.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (edgeStartX.current === 0) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - edgeStartX.current;
      const diffY = currentY - edgeStartY.current;

      if (diffX > 10 && diffX > Math.abs(diffY)) {
        isEdgeSwiping.current = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (edgeStartX.current === 0) return;
      const currentX = e.changedTouches[0].clientX;
      const diffX = currentX - edgeStartX.current;

      if (isEdgeSwiping.current && diffX > 35) {
        if (settingsOpen) {
          setSettingsOpen(false);
        } else if (currentPage === 'page-public-profile') {
          navigateTo(pubProfileBackPage || 'page-leaderboard');
        } else if (currentPage === 'page-user-posts-detail') {
          navigateTo(detailViewBackPage || 'page-profile');
        } else if (currentPage === 'page-map-view') {
          navigateTo(subPageBackPage || 'page-home');
        } else if (currentPage === 'page-friends') {
          navigateTo(subPageBackPage || 'page-home');
        } else if (currentPage === 'page-rules') {
          navigateTo(subPageBackPage || 'page-home');
        } else if (currentPage === 'page-admin') {
          const backTarget = (subPageBackPage && subPageBackPage !== 'page-admin' && subPageBackPage !== 'page-public-profile') ? subPageBackPage : 'page-profile';
          navigateTo(backTarget);
        }
      }

      edgeStartX.current = 0;
      edgeStartY.current = 0;
      isEdgeSwiping.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPage, settingsOpen, pubProfileBackPage, detailViewBackPage, subPageBackPage]);

  // Tag Requests (Sblocco in Compagnia) State & Listeners
  const [myTagRequests, setMyTagRequests] = useState<TagRequestItem[]>([]);
  const [activeTagRequestModal, setActiveTagRequestModal] = useState<TagRequestItem | null>(null);

  useEffect(() => {
    if (!currentUserNick) return;
    const tagReqRef = ref(db, `tag_requests/${currentUserNick}`);
    const unsubscribe = onValue(tagReqRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const pendingList: TagRequestItem[] = (Object.values(data) as any[]).filter(
          (item: any) => item && item.status === 'pending'
        );
        setMyTagRequests(pendingList);
      } else {
        setMyTagRequests([]);
      }
    });
    return () => unsubscribe();
  }, [currentUserNick]);

  const handleAcceptTagRequest = async (request: TagRequestItem, replaceExisting: boolean) => {
    try {
      const formattedBrand = formatBeerTitle(request.brand);
      const formattedVariant = formatBeerTitle(request.variant);
      const uniqueId = `${formattedBrand}-${formattedVariant}`;

      // 1. Save entry to current user's pokedex profile
      const pokedexEntry = {
        photo: request.photo,
        isShiny: request.isShiny || false,
        isShared: true,
        taggedFriend: request.fromUser,
        taggedFriends: [request.fromUser],
        brand: formattedBrand,
        variant: formattedVariant,
        timestamp: Date.now(),
      };

      await set(ref(db, `pokedex_profiles/${currentUserNick}/${uniqueId}`), pokedexEntry);

      // 2. Mark tag request as accepted in DB
      await update(ref(db, `tag_requests/${currentUserNick}/${request.requestId}`), {
        status: 'accepted',
      });

      // 3. Recalculate score & trigger pop sound
      await recalculateTotalScore(currentUserNick);
      playPopSound();

      setActiveTagRequestModal(null);

      // Offer rating modal to the accepting participant
      setUnlockRatingModalState({
        isOpen: true,
        brand: formattedBrand,
        variant: formattedVariant,
      });

      showAlert(
        replaceExisting
          ? `Sblocco per "${formattedBrand} - ${formattedVariant}" sostituito con successo! Foto e punti aggiornati.`
          : `Sblocco in compagnia per "${formattedBrand} - ${formattedVariant}" aggiunto alla tua collezione!`,
        'Sblocco Conquistato! 🍺'
      );
    } catch (err: any) {
      showAlert('Errore durante l\'accettazione dello sblocco: ' + err.message, 'Errore');
    }
  };

  const handleRejectTagRequest = async (requestId: string) => {
    try {
      await update(ref(db, `tag_requests/${currentUserNick}/${requestId}`), {
        status: 'rejected',
      });
      setActiveTagRequestModal(null);
      showAlert('Richiesta di sblocco in compagnia rifiutata.', 'Info');
    } catch (err: any) {
      showAlert('Errore durante il rifiuto della richiesta: ' + err.message, 'Errore');
    }
  };
  const [permissionModalState, setPermissionModalState] = useState<{
    isOpen: boolean;
    type: PermissionType;
    onGranted?: () => void;
  }>({ isOpen: false, type: 'location' });

  const requestPermission = (type: PermissionType, onGranted: () => void) => {
    const permKey = type === 'location'
      ? 'beerdex_location_permission'
      : type === 'camera'
      ? 'beerdex_camera_permission'
      : 'beerdex_gallery_permission';

    const stored = localStorage.getItem(permKey);
    if (stored === 'always' || stored === 'while_using') {
      onGranted();
    } else if (stored === 'denied') {
      showAlert(
        type === 'location'
          ? 'Hai disattivato i permessi di Posizione per POP IT nelle impostazioni del dispositivo.'
          : type === 'camera'
          ? 'Hai disattivato i permessi della Fotocamera per POP IT nelle impostazioni del dispositivo.'
          : 'Hai disattivato i permessi per le Foto per POP IT nelle impostazioni del dispositivo.',
        'Permesso non concesso'
      );
    } else {
      setPermissionModalState({ isOpen: true, type, onGranted });
    }
  };

  const handlePermissionChoice = (choice: PermissionChoice) => {
    const permKey = permissionModalState.type === 'location'
      ? 'beerdex_location_permission'
      : permissionModalState.type === 'camera'
      ? 'beerdex_camera_permission'
      : 'beerdex_gallery_permission';

    localStorage.setItem(permKey, choice);
    const callback = permissionModalState.onGranted;
    setPermissionModalState((prev) => ({ ...prev, isOpen: false }));

    if ((choice === 'always' || choice === 'while_using') && callback) {
      callback();
    }
  };



  // Lock body scroll when any modal / unlock panel is open
  useEffect(() => {
    const isModalOpen =
      scannerConfig.open ||
      captureOpen ||
      storyCaptureOpen ||
      cropOpen ||
      !!unlockRatingModalState?.isOpen ||
      proposeModalOpen ||
      activeTagRequestModal !== null ||
      myTagRequests.length > 0 ||
      alertConfig.open ||
      confirmConfig.open ||
      activeStoryViewerIndex !== null ||
      isStoryEditorOpen ||
      permissionModalState.isOpen ||
      avatarSelectorOpen ||
      settingsOpen;

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [
    scannerConfig.open,
    captureOpen,
    storyCaptureOpen,
    cropOpen,
    unlockRatingModalState,
    proposeModalOpen,
    activeTagRequestModal,
    myTagRequests.length,
    alertConfig.open,
    confirmConfig.open,
    activeStoryViewerIndex,
    isStoryEditorOpen,
    permissionModalState.isOpen,
    avatarSelectorOpen,
    settingsOpen,
  ]);

  // check age gate on mount
  useEffect(() => {
    if (localStorage.getItem('beerdex_18plus') === 'yes') {
      setAgeGateOpen(false);
    }
  }, []);

  // Adjust body padding-top dynamically and reset scroll positions
  useEffect(() => {
    document.body.style.paddingTop = '0px';

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
      document.body.classList.add('settings-open');
    } else {
      document.body.classList.remove('settings-open');
    }
    return () => {
      document.body.classList.remove('settings-open');
    };
  }, [settingsOpen, globalDisplayNames, currentUserNick]);

  // Listen to Auth State
  useEffect(() => {
    if (ageGateOpen) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
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
            const rawFallback = user.email ? user.email.split('@')[0] : 'Utente';
            nickname = rawFallback.replace(/[.#$\[\]]/g, '_');
            try {
              await set(ref(db, `users_directory/${user.uid}`), nickname);
              await set(ref(db, `usernames_emails/${nickname.toLowerCase()}`), email);
            } catch (e) {
              console.error("Errore salvataggio nickname fallback:", e);
            }
          }

          if (/[.#$\[\]]/.test(nickname)) {
            nickname = nickname.replace(/[.#$\[\]]/g, '_');
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
      } catch (err: any) {
        console.error("Errore onAuthStateChanged:", err);
      }
    });

    return () => unsubscribe();
  }, [ageGateOpen]);

  const cleanupAndMigrateCustomBeers = async (targetNick: string) => {
    if (!targetNick) return;
    try {
      const updates: Record<string, any> = {};
      let needsUpdate = false;

      // 1. Clean up duplicate custom_beers entries in Firebase
      const customSnap = await get(ref(db, 'custom_beers'));
      if (customSnap.exists()) {
        const customData = customSnap.val();
        Object.entries(customData).forEach(([cKey, cVal]: [string, any]) => {
          if (cVal && cVal.brand) {
            const normCBrand = normalizeStr(cVal.brand);
            const isStaticMatch = beers.some((b) => normalizeStr(b.brand) === normCBrand) ||
              normCBrand.includes('deforest') || normCBrand.includes('baiadeforest') || normCBrand.includes('abbay');
            if (isStaticMatch) {
              updates[`custom_beers/${cKey}`] = null;
              needsUpdate = true;
            }
          }
        });
      }

      // 1b. Clean up duplicate beer_proposals in Firebase
      const propSnap = await get(ref(db, 'beer_proposals'));
      if (propSnap.exists()) {
        const propData = propSnap.val();
        Object.entries(propData).forEach(([pId, pVal]: [string, any]) => {
          if (pVal && pVal.brand) {
            const normPBrand = normalizeStr(pVal.brand);
            if (normPBrand.includes('deforest') || normPBrand.includes('baiadeforest') || normPBrand.includes('abbay')) {
              updates[`beer_proposals/${pId}`] = null;
              needsUpdate = true;
            }
          }
        });
      }

      // 2. Migrate user's pokedex entries to canonical brand and key
      const pokedexSnap = await get(ref(db, `pokedex_profiles/${targetNick}`));
      if (pokedexSnap.exists()) {
        const pokedexData = pokedexSnap.val();
        Object.entries(pokedexData).forEach(([pKey, pVal]: [string, any]) => {
          if (pVal) {
            const pBrand = pVal.brand || (pKey.includes('-') ? pKey.split('-')[0] : pKey);
            const normPBrand = normalizeStr(pBrand);
            if (normPBrand.includes('deforest') || normPBrand.includes('baiadeforest') || normPBrand.includes('abbay')) {
              const canonicalBrand = 'Abbaye de Forest';
              const variant = pVal.variant || (pKey.includes('-') ? pKey.split('-').slice(1).join('-') : 'Brune');
              const canonicalKey = `${canonicalBrand}-${variant}`;

              if (pKey !== canonicalKey || pVal.brand !== canonicalBrand) {
                if (pKey !== canonicalKey) {
                  updates[`pokedex_profiles/${targetNick}/${pKey}`] = null;
                }
                updates[`pokedex_profiles/${targetNick}/${canonicalKey}`] = {
                  ...pVal,
                  brand: canonicalBrand,
                  variant: variant,
                  timestamp: pVal.timestamp || Date.now()
                };
                needsUpdate = true;
              }
            }
          }
        });
      }

      // 3. Migrate social_timeline posts
      const timelineSnap = await get(ref(db, 'social_timeline'));
      if (timelineSnap.exists()) {
        const timelineData = timelineSnap.val();
        Object.entries(timelineData).forEach(([postKey, postVal]: [string, any]) => {
          if (postVal && postVal.brand) {
            const normPostBrand = normalizeStr(postVal.brand);
            if (normPostBrand.includes('deforest') || normPostBrand.includes('baiadeforest') || normPostBrand.includes('abbay')) {
              if (postVal.brand !== 'Abbaye de Forest') {
                updates[`social_timeline/${postKey}/brand`] = 'Abbaye de Forest';
                needsUpdate = true;
              }
            }
          }
        });
      }

      if (needsUpdate) {
        await update(ref(db), updates);
        await recalculateTotalScore(targetNick);
      }
    } catch (err) {
      console.error('Errore durante la migrazione delle birre custom:', err);
    }
  };

  useEffect(() => {
    if (currentUserNick) {
      cleanupAndMigrateCustomBeers(currentUserNick);
    }
  }, [currentUserNick]);

  // Setup app listeners
  const setupRealtimeListeners = (nickname: string) => {
    // Calibrate all scores on initial sync
    recalculateAllScores();
    if (nickname) {
      cleanupAndMigrateCustomBeers(nickname);
    }

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
      if (nickname) {
        recalculateTotalScore(nickname);
      }
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

    // User Notifications (e.g. brand medal revoked due to new variant)
    if (nickname) {
      onValue(ref(db, `user_notifications/${nickname}`), (snap) => {
        if (snap.exists()) {
          const val = snap.val();
          for (const key in val) {
            const notif = val[key];
            if (notif && notif.message) {
              showAlert(notif.message, notif.title || 'Avviso');
            }
            remove(ref(db, `user_notifications/${nickname}/${key}`));
          }
        }
      });
    }

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

    // All Pokedex Profiles (for Ratings & Stats)
    onValue(ref(db, 'pokedex_profiles'), (snap) => {
      setAllPokedexProfiles(snap.val() || {});
    });
  };

  // Score Recalculation
  const recalculateTotalScore = async (username: string) => {
    if (!username) return;
    let snap = await get(ref(db, `pokedex_profiles/${username}`));

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

    // 1. Backfill pokedex_profiles from social_timeline checkins if missing
    const timelineSnap = await get(ref(db, 'social_timeline'));
    const userPosts: any[] = [];
    const validPostKeysSet = new Set<string>();

    if (timelineSnap.exists()) {
      const timelineData = timelineSnap.val();
      const dexUpdates: Record<string, any> = {};
      let needsDexUpdate = false;
      const existingDex = snap.exists() ? snap.val() : {};

      for (const key in timelineData) {
        const post = timelineData[key];
        if (post && !post.isStory && isUserParticipantInPost(post, username)) {
          userPosts.push(post);
          if (post.brand && post.variant) {
            const { brand: resolvedB, variant: resolvedV } = resolvePokedexEntryBeer(
              `${post.brand}-${post.variant}`,
              post,
              currentCatalog
            );
            const canonicalB = resolvedB || formatBeerTitle(post.brand);
            const canonicalV = resolvedV || formatBeerTitle(post.variant);
            const uId = `${canonicalB}-${canonicalV}`;

            validPostKeysSet.add(uId);
            validPostKeysSet.add(stripStr(uId));
            validPostKeysSet.add(`${stripStr(post.brand)}-${stripStr(post.variant)}`);

            if (post.user && post.user.toLowerCase() === username.toLowerCase()) {
              const existingMatchingKey = Object.keys(existingDex).find(
                (k) => stripStr(k) === stripStr(uId) || stripStr(k) === `${stripStr(post.brand)}-${stripStr(post.variant)}`
              );
              const targetKey = existingMatchingKey || uId;

              if (!existingDex[targetKey] && !dexUpdates[targetKey]) {
                dexUpdates[targetKey] = {
                  photo: post.photo || '',
                  isShiny: post.isShiny || false,
                  isShared: post.isShared || false,
                  taggedFriend: post.taggedFriend || null,
                  brand: canonicalB,
                  variant: canonicalV,
                  timestamp: post.time || Date.now(),
                };
                needsDexUpdate = true;
              }
            }
          }
        }
      }

      if (needsDexUpdate) {
        await update(ref(db, `pokedex_profiles/${username}`), dexUpdates);
        snap = await get(ref(db, `pokedex_profiles/${username}`));
      }
    }

    // 2. Clean up any orphan pokedex_profiles entries whose post was deleted
    if (snap.exists()) {
      const profileData = snap.val();
      const keysToRemove: string[] = [];

      for (const uniqueId in profileData) {
        const entry = profileData[uniqueId];
        const strippedKey = stripStr(uniqueId);
        const entryBrand = entry.brand || (uniqueId.includes('-') ? uniqueId.split('-')[0] : uniqueId);
        const entryVariant = entry.variant || (uniqueId.includes('-') ? uniqueId.split('-').slice(1).join('-') : 'Classica');
        const strippedBrandVar = `${stripStr(entryBrand)}-${stripStr(entryVariant)}`;

        const isMatchInPosts =
          validPostKeysSet.has(uniqueId) ||
          validPostKeysSet.has(strippedKey) ||
          validPostKeysSet.has(strippedBrandVar);

        // Keep if created via accepted proposal bonus or if matching timeline post exists
        if (!entry.proposalBonus && !entry.isProposalBonus && !isMatchInPosts) {
          keysToRemove.push(uniqueId);
        }
      }

      if (keysToRemove.length > 0) {
        for (const rKey of keysToRemove) {
          await remove(ref(db, `pokedex_profiles/${username}/${rKey}`));
        }
        snap = await get(ref(db, `pokedex_profiles/${username}`));
      }
    }

    const currentDexData = snap.exists() ? snap.val() : {};

    // 3. Compute score breakdown deterministically using calculateScoreBreakdown
    const cleanUserPosts = getUniqueParticipantPosts(userPosts, username);
    const breakdown = calculateScoreBreakdown(currentDexData, cleanUserPosts, currentCatalog);
    const totalScore = breakdown.total;

    // 4. Brand Completion Medals & Revocation Check
    const brandMedalsSnap = await get(ref(db, `user_brand_medals/${username}`));
    const prevCompletedMedals = brandMedalsSnap.exists() ? brandMedalsSnap.val() : {};
    const newCompletedMedals: Record<string, any> = {};

    const brandUnlockedVariantsMap: Record<string, Set<string>> = {};
    currentCatalog.forEach((b) => {
      if (b && b.brand) brandUnlockedVariantsMap[b.brand] = new Set<string>();
    });
    Object.keys(currentDexData).forEach((key) => {
      const entry = currentDexData[key];
      if (!entry) return;
      const { beer, brand, variant } = resolvePokedexEntryBeer(key, entry, currentCatalog);
      const bName = beer ? beer.brand : brand;
      if (bName) {
        if (!brandUnlockedVariantsMap[bName]) brandUnlockedVariantsMap[bName] = new Set<string>();
        if (variant) brandUnlockedVariantsMap[bName].add(formatBeerTitle(variant));
      }
    });

    currentCatalog.forEach((beer) => {
      const vars = Array.isArray(beer?.variants) ? beer.variants : ['Classica'];
      const bName = beer.brand;
      const unlockedSet = brandUnlockedVariantsMap[bName];
      const isCompleted = vars.length > 0 && unlockedSet && unlockedSet.size >= vars.length;

      if (isCompleted) {
        newCompletedMedals[bName] = {
          completed: true,
          totalVariantsAtUnlock: vars.length,
          updatedAt: Date.now(),
        };
      } else if (prevCompletedMedals[bName]) {
        // Medal was previously completed, but now user lacks variant(s) -> Revoke medal and notify!
        const notifMsg = `⚠️ Nuova variante per ${bName}!\nÈ stata aggiunta una nuova variante per la birra ${bName}. La tua medaglia brand è stata temporaneamente sospesa finché non la sbloccherai!`;
        if (username === currentUserNick) {
          showAlert(notifMsg, 'Medaglia Brand Sospesa 🍺');
        } else {
          push(ref(db, `user_notifications/${username}`), {
            title: 'Medaglia Brand Sospesa 🍺',
            message: notifMsg,
            time: Date.now(),
          });
        }
      }
    });

    await set(ref(db, `user_brand_medals/${username}`), newCompletedMedals);
    await set(ref(db, `leaderboard_scores/${username}`), totalScore);
  };

  // Proposal Handlers
  const handleProposeBeerSubmit = async (proposalData: BeerProposalData) => {
    try {
      const isVariant = proposalData.isVariantProposal ?? false;
      const bonusPoints = isVariant ? 1 : 2;
      const newRef = push(ref(db, 'beer_proposals'));
      const proposalObj = {
        proposalId: newRef.key!,
        brand: proposalData.brand,
        variant: proposalData.variant,
        beerType: proposalData.beerType,
        country: proposalData.country,
        regione: proposalData.regione || null,
        rarity: proposalData.rarity,
        desc: proposalData.desc || null,
        photo: proposalData.photo,
        proposedBy: currentUserNick,
        taggedFriends: proposalData.taggedFriends || [],
        timestamp: Date.now(),
        status: 'pending',
        isVariantProposal: isVariant,
        bonusPoints: bonusPoints,
      };
      await set(newRef, proposalObj);

      const inCompagniaMsg = proposalData.taggedFriends && proposalData.taggedFriends.length > 0
        ? ` in compagnia di ${proposalData.taggedFriends.map((f) => '@' + f).join(', ')}`
        : '';

      showAlert(
        `Proposta per "${proposalData.brand} - ${proposalData.variant}"${inCompagniaMsg} inviata agli admin! Se approvata, verrà aggiunta al catalogo, la sbloccherete nel Pokédex e riceverete i punti della birra + ${bonusPoints} Punti Bonus ciascuno!`,
        'Proposta Inviata!'
      );
    } catch (err: any) {
      showAlert('Errore durante l\'invio della proposta: ' + err.message, 'Errore');
    }
  };

  const handleSendFeedback = async (message: string) => {
    try {
      const newRef = push(ref(db, 'app_feedback'));
      await set(newRef, {
        feedbackId: newRef.key!,
        user: currentUserNick,
        message: message.trim(),
        timestamp: Date.now(),
        status: 'unread',
      });
    } catch (err: any) {
      showAlert('Errore durante l\'invio del messaggio: ' + err.message, 'Errore');
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await remove(ref(db, `app_feedback/${feedbackId}`));
    } catch (err: any) {
      showAlert('Errore durante la cancellazione: ' + err.message, 'Errore');
    }
  };

  const handleMarkFeedbackRead = async (feedbackId: string) => {
    try {
      await update(ref(db, `app_feedback/${feedbackId}`), { status: 'read' });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAcceptProposal = async (proposal: BeerProposalItem) => {
    try {
      const formattedBrand = formatBeerTitle(proposal.brand);
      const formattedVariant = formatBeerTitle(proposal.variant);
      const formattedCountry = formatBeerTitle((proposal.country || 'Non specificata').trim());
      const isVariant = proposal.isVariantProposal ?? false;
      const bonusPoints = proposal.bonusPoints ?? (isVariant ? 1 : 2);
      const beerType = proposal.beerType || 'bionda';

      // 1. Save new custom beer to catalog in Firebase DB
      const newCustomBeer: Beer = {
        brand: formattedBrand,
        country: formattedCountry,
        flag: getCountryFlag(formattedCountry),
        rarity: proposal.rarity,
        desc: proposal.desc || `Birra ${formattedBrand} (${formattedVariant})`,
        variants: [formattedVariant],
        barcodes: [],
        beerType: beerType,
      };
      if (proposal.regione) {
        newCustomBeer.regione = proposal.regione;
      }
      await set(ref(db, `custom_beers/${proposal.proposalId}`), newCustomBeer);

      // 2. Determine all participants (proposer + tagged friends)
      const rawParticipants = [proposal.proposedBy, ...(proposal.taggedFriends || [])].filter(Boolean);
      const participants = Array.from(new Set(rawParticipants));
      const isSharedGroup = participants.length > 1;
      const uniqueId = `${formattedBrand}-${formattedVariant}`;

      // 3. Unlock beer for all participants with proposalBonus & recalculate scores
      for (const userNick of participants) {
        const pokedexEntry = {
          brand: formattedBrand,
          variant: formattedVariant,
          photo: proposal.photo,
          unlockedAt: Date.now(),
          isShiny: false,
          isShared: isSharedGroup,
          proposalBonus: bonusPoints,
          proposalType: isVariant ? 'variant' : 'brand',
        };
        await set(ref(db, `pokedex_profiles/${userNick}/${uniqueId}`), pokedexEntry);
        await recalculateTotalScore(userNick);

        if (userNick !== proposal.proposedBy) {
          const notifRef = push(ref(db, `user_notifications/${userNick}`));
          await set(notifRef, {
            title: 'Birra Approvata!',
            message: `La birra "${formattedBrand} - ${formattedVariant}" proposta da @${proposal.proposedBy} in tua compagnia è stata approvata dagli Admin! L'hai sbloccata nel Pokédex con +${bonusPoints} Punti Bonus!`,
            timestamp: Date.now(),
          });
        }
      }

      // 4. Post to social timeline for the proposal
      const taggedFriendsList = (proposal.taggedFriends || []).filter((f) => f !== proposal.proposedBy);
      const taggedFriendStr = taggedFriendsList.length > 0 ? taggedFriendsList.join(', ') : null;

      const newPostRef = push(ref(db, 'social_timeline'));
      await set(newPostRef, {
        user: proposal.proposedBy,
        brand: formattedBrand,
        variant: formattedVariant,
        photo: proposal.photo,
        time: Date.now(),
        isShiny: false,
        isShared: isSharedGroup,
        proposalBonus: bonusPoints,
        taggedFriend: taggedFriendStr,
        taggedFriends: taggedFriendsList,
      });

      // 5. Update proposal status to accepted in DB
      await update(ref(db, `beer_proposals/${proposal.proposalId}`), {
        brand: formattedBrand,
        variant: formattedVariant,
        country: formattedCountry,
        regione: proposal.regione || null,
        rarity: proposal.rarity,
        desc: proposal.desc || null,
        status: 'accepted',
        isVariantProposal: isVariant,
        bonusPoints: bonusPoints,
      });

      const participantText = participants.map((p) => '@' + p).join(', ');
      showAlert(
        `Proposta "${formattedBrand} - ${formattedVariant}" ACCETTATA! Nuova birra inserita nel catalogo e sbloccata con +${bonusPoints} Punti Bonus per: ${participantText}.`,
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

  const handleDeleteUserProfile = async (targetUsername: string) => {
    if (!isAdminUser || !targetUsername) return;
    if (targetUsername.toLowerCase() === currentUserNick.toLowerCase()) {
      showAlert("Non puoi eliminare il tuo stesso profilo amministratore!", "Operazione Non Consentita");
      return;
    }

    try {
      const updates: Record<string, any> = {};
      const targetLower = targetUsername.toLowerCase();

      // 1. Rimuovi da usernames_emails (ricerca case-insensitive)
      const emailsSnap = await get(ref(db, 'usernames_emails'));
      if (emailsSnap.exists()) {
        emailsSnap.forEach((child) => {
          if (child.key.toLowerCase() === targetLower) {
            updates[`usernames_emails/${child.key}`] = null;
          }
        });
      } else {
        updates[`usernames_emails/${targetLower}`] = null;
      }

      // 2. Rimuovi da users_directory cercando l'UID associato
      const dirSnap = await get(ref(db, 'users_directory'));
      if (dirSnap.exists()) {
        const dirData = dirSnap.val();
        Object.entries(dirData).forEach(([uidKey, nickVal]: [string, any]) => {
          if ((nickVal || '').toString().trim().toLowerCase() === targetLower) {
            updates[`users_directory/${uidKey}`] = null;
          }
        });
      }

      // 3. Rimuovi tutti i nodi profilo e dati utente (controllo chiavi case-insensitive)
      const topLevelUserNodes = [
        'users',
        'pokedex_profiles',
        'leaderboard_scores',
        'users_avatars',
        'avatars',
        'display_names',
        'users_display_names',
        'privacy_settings',
        'user_privacy',
        'user_notifications',
        'user_brand_medals',
        'user_trophies',
        'score_breakdowns',
        'unlocked_trophies',
      ];

      for (const nodeName of topLevelUserNodes) {
        const snap = await get(ref(db, nodeName));
        if (snap.exists()) {
          snap.forEach((child) => {
            if (child.key.toLowerCase() === targetLower) {
              updates[`${nodeName}/${child.key}`] = null;
            }
          });
        }
      }

      // 4. Rimuovi le relazioni d'amicizia da TUTTI gli utenti in users_friends e user_friends
      const friendNodes = ['users_friends', 'user_friends'];
      for (const fNode of friendNodes) {
        const snap = await get(ref(db, fNode));
        if (snap.exists()) {
          snap.forEach((userSnap) => {
            const userKey = userSnap.key;
            if (userKey.toLowerCase() === targetLower) {
              // Cancella l'intero nodo dell'utente eliminato
              updates[`${fNode}/${userKey}`] = null;
            } else {
              // Cancella la voce dell'utente eliminato dalla lista amici degli altri utenti
              userSnap.forEach((friendSnap) => {
                if (friendSnap.key.toLowerCase() === targetLower) {
                  updates[`${fNode}/${userKey}/${friendSnap.key}`] = null;
                }
              });
            }
          });
        }
      }

      // 5. Rimuovi richieste di amicizia (inviate, ricevute, rifiutate) da TUTTI gli utenti
      const reqNodes = ['friend_requests', 'friend_requests_sent', 'friend_requests_rejected'];
      for (const rNode of reqNodes) {
        const snap = await get(ref(db, rNode));
        if (snap.exists()) {
          snap.forEach((userSnap) => {
            const userKey = userSnap.key;
            if (userKey.toLowerCase() === targetLower) {
              updates[`${rNode}/${userKey}`] = null;
            } else {
              userSnap.forEach((otherSnap) => {
                if (otherSnap.key.toLowerCase() === targetLower) {
                  updates[`${rNode}/${userKey}/${otherSnap.key}`] = null;
                }
              });
            }
          });
        }
      }

      // 6. Rimuovi richieste di tag in tag_requests per tutti gli utenti
      const tagSnap = await get(ref(db, 'tag_requests'));
      if (tagSnap.exists()) {
        tagSnap.forEach((userSnap) => {
          const userKey = userSnap.key;
          if (userKey.toLowerCase() === targetLower) {
            updates[`tag_requests/${userKey}`] = null;
          } else {
            userSnap.forEach((reqSnap) => {
              const reqVal = reqSnap.val();
              if (
                reqVal &&
                (
                  (reqVal.fromUser && reqVal.fromUser.toLowerCase() === targetLower) ||
                  (reqVal.taggedFriend && reqVal.taggedFriend.toLowerCase() === targetLower)
                )
              ) {
                updates[`tag_requests/${userKey}/${reqSnap.key}`] = null;
              }
            });
          }
        });
      }

      // 7. Rimuovi i post dell'utente e i suoi like/rating dagli ALTRI post in social_timeline
      const timelineSnap = await get(ref(db, 'social_timeline'));
      if (timelineSnap.exists()) {
        timelineSnap.forEach((child) => {
          const p = child.val();
          if (p) {
            if (p.user && p.user.toLowerCase() === targetLower) {
              updates[`social_timeline/${child.key}`] = null;
            } else {
              if (p.likes && typeof p.likes === 'object') {
                Object.keys(p.likes).forEach((likeUser) => {
                  if (likeUser.toLowerCase() === targetLower) {
                    updates[`social_timeline/${child.key}/likes/${likeUser}`] = null;
                  }
                });
              }
              if (p.ratings && typeof p.ratings === 'object') {
                Object.keys(p.ratings).forEach((rateUser) => {
                  if (rateUser.toLowerCase() === targetLower) {
                    updates[`social_timeline/${child.key}/ratings/${rateUser}`] = null;
                  }
                });
              }
              if (Array.isArray(p.taggedFriends)) {
                const filtered = p.taggedFriends.filter((t: string) => t && t.toLowerCase() !== targetLower);
                if (filtered.length !== p.taggedFriends.length) {
                  updates[`social_timeline/${child.key}/taggedFriends`] = filtered;
                }
              }
            }
          }
        });
      }

      // 8. Rimuovi le storie dell'utente da pub_stories
      const pubStoriesSnap = await get(ref(db, 'pub_stories'));
      if (pubStoriesSnap.exists()) {
        pubStoriesSnap.forEach((child) => {
          const s = child.val();
          if (s && s.user && s.user.toLowerCase() === targetLower) {
            updates[`pub_stories/${child.key}`] = null;
          }
        });
      }

      // 9. Rimuovi post segnalati dell'utente
      const flaggedSnap = await get(ref(db, 'flagged_posts'));
      if (flaggedSnap.exists()) {
        flaggedSnap.forEach((child) => {
          const f = child.val();
          if (f && f.postUser && f.postUser.toLowerCase() === targetLower) {
            updates[`flagged_posts/${child.key}`] = null;
          }
        });
      }

      // 10. Rimuovi proposte birra inviate dall'utente
      const proposalsSnap = await get(ref(db, 'beer_proposals'));
      if (proposalsSnap.exists()) {
        proposalsSnap.forEach((child) => {
          const prop = child.val();
          if (
            prop &&
            (
              (prop.proposedBy && prop.proposedBy.toLowerCase() === targetLower) ||
              (prop.user && prop.user.toLowerCase() === targetLower)
            )
          ) {
            updates[`beer_proposals/${child.key}`] = null;
          }
        });
      }

      // Esegui la cancellazione atomica su Firebase Realtime Database
      await update(ref(db), updates);

      // Aggiorna immediatamente lo stato locale per nascondere subito l'utente eliminato
      setMyFriendsList((prev) => prev.filter((f) => f.toLowerCase() !== targetLower));
      setMyReceivedRequests((prev) => prev.filter((r) => r.toLowerCase() !== targetLower));
      setMySentRequests((prev) => prev.filter((s) => s.toLowerCase() !== targetLower));
      setMyRejectedRequests((prev) => prev.filter((r) => r.toLowerCase() !== targetLower));

      showAlert(`Il profilo dell'utente @${targetUsername} è stato definitivamente eliminato da Firebase. Tutte le sue relazioni di amicizia, richieste, post e dati associati sono stati rimossi.`, 'Profilo Eliminato');

      if (currentPage === 'page-public-profile' && pubProfileUser && pubProfileUser.toLowerCase() === targetLower) {
        navigateTo('page-home');
      }
    } catch (err: any) {
      showAlert("Errore durante l'eliminazione del profilo: " + err.message, "Errore DB");
    }
  };

  const handleAdminChangeUserNickname = async (targetOldNick: string, rawNewNick: string) => {
    if (!isAdminUser || !targetOldNick) return;
    const newNick = (rawNewNick || '').trim();

    if (!newNick || newNick.toLowerCase() === targetOldNick.toLowerCase()) {
      return;
    }

    if (/[.#$\[\]]/.test(newNick)) {
      showAlert("Il nickname non può contenere i caratteri speciali . # $ [ ]", "Caratteri Non Validi");
      return;
    }

    if (containsProfanity(newNick)) {
      showAlert("Il nuovo nickname contiene termini non appropriati o non ammessi.", "Nickname Non Valido");
      return;
    }

    try {
      // 1. Verifica se il nickname appartiene a un utente ATTIVO diverso da quello rinominato
      const emailSnap = await get(ref(db, `usernames_emails/${newNick.toLowerCase()}`));
      const dirSnap = await get(ref(db, 'users_directory'));
      
      let targetUid: string | null = null;
      let isNickInActiveDirectory = false;

      if (dirSnap.exists()) {
        const dirData = dirSnap.val();
        Object.entries(dirData).forEach(([uidKey, nickVal]: [string, any]) => {
          const formattedNick = (nickVal || '').toString().trim();
          if (formattedNick.toLowerCase() === targetOldNick.toLowerCase()) {
            targetUid = uidKey;
          }
          if (formattedNick.toLowerCase() === newNick.toLowerCase() && formattedNick.toLowerCase() !== targetOldNick.toLowerCase()) {
            isNickInActiveDirectory = true;
          }
        });
      }

      if (emailSnap.exists() && isNickInActiveDirectory) {
        showAlert(`Il nickname @${newNick} è già occupato da un altro utente attivo!`, "Nickname Già In Uso");
        return;
      }

      const updates: any = {};

      // Migra users_directory
      if (targetUid) {
        updates[`users_directory/${targetUid}`] = newNick;
      }

      // Migra usernames_emails
      const oldEmailSnap = await get(ref(db, `usernames_emails/${targetOldNick.toLowerCase()}`));
      const userEmail = oldEmailSnap.exists() ? oldEmailSnap.val() : '';
      if (userEmail) {
        updates[`usernames_emails/${newNick.toLowerCase()}`] = userEmail;
        updates[`usernames_emails/${targetOldNick.toLowerCase()}`] = null;
      } else {
        // Se non trova l'email originale, pulisce l'eventuale voce orfana del nuovo nick
        updates[`usernames_emails/${newNick.toLowerCase()}`] = `user_${Date.now()}@popit.app`;
        updates[`usernames_emails/${targetOldNick.toLowerCase()}`] = null;
      }

      // Migra leaderboard_scores
      const scoreSnap = await get(ref(db, `leaderboard_scores/${targetOldNick}`));
      if (scoreSnap.exists()) {
        updates[`leaderboard_scores/${newNick}`] = scoreSnap.val();
        updates[`leaderboard_scores/${targetOldNick}`] = null;
      }

      // Migra pokedex_profiles
      const pokedexSnap = await get(ref(db, `pokedex_profiles/${targetOldNick}`));
      if (pokedexSnap.exists()) {
        updates[`pokedex_profiles/${newNick}`] = pokedexSnap.val();
        updates[`pokedex_profiles/${targetOldNick}`] = null;
      }

      // Migra users_avatars
      const avatarSnap = await get(ref(db, `users_avatars/${targetOldNick}`));
      if (avatarSnap.exists()) {
        updates[`users_avatars/${newNick}`] = avatarSnap.val();
        updates[`users_avatars/${targetOldNick}`] = null;
      }

      // Migra user_privacy
      const privacySnap = await get(ref(db, `user_privacy/${targetOldNick}`));
      if (privacySnap.exists()) {
        updates[`user_privacy/${newNick}`] = privacySnap.val();
        updates[`user_privacy/${targetOldNick}`] = null;
      }

      // Migra users_friends
      const friendsSnap = await get(ref(db, `users_friends/${targetOldNick}`));
      if (friendsSnap.exists()) {
        const friendsData = friendsSnap.val();
        updates[`users_friends/${newNick}`] = friendsData;
        updates[`users_friends/${targetOldNick}`] = null;

        Object.keys(friendsData).forEach((friendNick) => {
          updates[`users_friends/${friendNick}/${newNick}`] = true;
          updates[`users_friends/${friendNick}/${targetOldNick}`] = null;
        });
      }

      // Aggiorna social_timeline per l'utente target
      const timelineSnap = await get(ref(db, 'social_timeline'));
      if (timelineSnap.exists()) {
        timelineSnap.forEach((child) => {
          const p = child.val();
          if (p && p.user && p.user.toLowerCase() === targetOldNick.toLowerCase()) {
            updates[`social_timeline/${child.key}/user`] = newNick;
          }
        });
      }

      // Aggiorna pub_stories per l'utente target
      const pubStoriesSnap = await get(ref(db, 'pub_stories'));
      if (pubStoriesSnap.exists()) {
        pubStoriesSnap.forEach((child) => {
          const s = child.val();
          if (s && s.user && s.user.toLowerCase() === targetOldNick.toLowerCase()) {
            updates[`pub_stories/${child.key}/user`] = newNick;
          }
        });
      }

      // Esegui la migrazione atomica nel Realtime Database
      await update(ref(db), updates);

      // Aggiorna la vista del profilo pubblico se l'admin stava guardando questo profilo
      if (pubProfileUser.toLowerCase() === targetOldNick.toLowerCase()) {
        setPubProfileUser(newNick);
      }

      triggerStappoAnimation(`NICKNAME @${newNick.toUpperCase()} AGGIORNATO!`, () => {
        showAlert(`Il nickname dell'utente @${targetOldNick} è stato modificato con successo in @${newNick}!`, "Nickname Aggiornato (ADMIN)");
      });
    } catch (e: any) {
      if (e.message !== "NICKNAME_TAKEN") {
        showAlert("Errore durante l'aggiornamento del nickname: " + e.message, "Errore Admin");
      }
    }
  };

  // Recalculate all scores to adapt existing database records across all users
  const recalculateAllScores = async () => {
    try {
      const usernames = new Set<string>();

      const scoresSnap = await get(ref(db, 'leaderboard_scores'));
      if (scoresSnap.exists()) Object.keys(scoresSnap.val()).forEach((u) => usernames.add(u));

      const dexProfilesSnap = await get(ref(db, 'pokedex_profiles'));
      if (dexProfilesSnap.exists()) Object.keys(dexProfilesSnap.val()).forEach((u) => usernames.add(u));

      const usersSnap = await get(ref(db, 'users'));
      if (usersSnap.exists()) Object.keys(usersSnap.val()).forEach((u) => usernames.add(u));

      const avatarsSnap = await get(ref(db, 'all_avatars'));
      if (avatarsSnap.exists()) Object.keys(avatarsSnap.val()).forEach((u) => usernames.add(u));

      const timelineSnap = await get(ref(db, 'social_timeline'));
      if (timelineSnap.exists()) {
        const timelineData = timelineSnap.val();
        for (const key in timelineData) {
          if (timelineData[key]?.user) usernames.add(timelineData[key].user);
        }
      }

      for (const username of usernames) {
        if (username) {
          await recalculateTotalScore(username);
        }
      }
    } catch (err) {
      console.error("Error recalculating all scores: ", err);
    }
  };

  // Helper visibility titles with matching rank icons
  const getUserRankTitle = (score: number, unlockedCount?: number) => {
    const totalVariants = (beers || []).reduce((acc, b) => acc + (Array.isArray(b?.variants) ? b.variants.length : 1), 0);
    if (unlockedCount !== undefined && unlockedCount >= totalVariants) {
      return "⚡ Ægir (Divinità Norrena della Birra)";
    }
    if (score < 50) return "🍺 Novizio del Pub";
    if (score < 200) return "🍺 Apprendista Bevitore";
    if (score < 500) return "🍺 Esploratore di Luppoli";
    if (score < 1200) return "🍺 Sommelier del Bancone";
    return "👑 Mastro Birraio";
  };

  // Navigation Logic
  const navigateTo = (pageId: string) => {
    const mainTabs = ['page-home', 'page-explore', 'page-leaderboard', 'page-social', 'page-profile'];
    if (!mainTabs.includes(pageId)) {
      setSubPageBackPage(currentPage);
    }
    // Close any active drawers, menus, or modals on view switch
    setSettingsOpen(false);
    setProposeModalOpen(false);
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

    // Scroll to the top when page changes or when active tab is re-pressed
    window.scrollTo(0, 0);
    document.querySelectorAll('.page-container-view, .page-container, .main-tab-slide').forEach((el) => {
      el.scrollTop = 0;
    });

    if (pageId === currentPage) return;

    setCurrentPage(pageId);

    try {
      sessionStorage.setItem('beerdex_currentPage', pageId);
    } catch (e) {
      // Ignore storage errors in private browsing
    }
  };



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
      playPopSound();
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
    requestPermission('camera', () => {
      setScannerConfig({ open: true, brand, variant });
    });
  };

  const handleScannerSuccess = (isSpinaBypass: boolean) => {
    setScannerConfig((prev) => ({ ...prev, open: false }));
    setCaptureOpen(true);
    // store bypass in states for camera callback
    setPendingUploadData({ isSpinaBypass });
  };

  const italianRegionBounds: Record<string, { latMin: number; latMax: number; lngMin: number; lngMax: number }> = {
    'Piemonte': { latMin: 44.05, latMax: 46.46, lngMin: 6.62, lngMax: 9.21 },
    'Lombardia': { latMin: 44.79, latMax: 46.63, lngMin: 8.50, lngMax: 11.42 },
    'Valle d\'Aosta': { latMin: 45.45, latMax: 45.98, lngMin: 6.79, lngMax: 7.94 },
    'Liguria': { latMin: 43.78, latMax: 44.66, lngMin: 7.50, lngMax: 10.05 },
    'Trentino-Alto Adige': { latMin: 45.68, latMax: 47.09, lngMin: 10.45, lngMax: 12.48 },
    'Veneto': { latMin: 44.79, latMax: 46.65, lngMin: 10.62, lngMax: 13.10 },
    'Friuli-Venezia Giulia': { latMin: 45.56, latMax: 46.65, lngMin: 12.32, lngMax: 13.92 },
    'Emilia-Romagna': { latMin: 44.05, latMax: 45.14, lngMin: 9.20, lngMax: 12.75 },
    'Toscana': { latMin: 42.24, latMax: 44.47, lngMin: 9.68, lngMax: 12.37 },
    'Umbria': { latMin: 42.40, latMax: 43.62, lngMin: 11.90, lngMax: 13.25 },
    'Marche': { latMin: 42.68, latMax: 43.97, lngMin: 12.15, lngMax: 13.92 },
    'Lazio': { latMin: 41.20, latMax: 42.84, lngMin: 11.45, lngMax: 13.90 },
    'Abruzzo': { latMin: 41.68, latMax: 42.89, lngMin: 13.02, lngMax: 14.78 },
    'Molise': { latMin: 41.38, latMax: 42.06, lngMin: 13.96, lngMax: 15.15 },
    'Campania': { latMin: 39.99, latMax: 41.51, lngMin: 13.75, lngMax: 15.65 },
    'Puglia': { latMin: 39.78, latMax: 41.90, lngMin: 14.92, lngMax: 18.52 },
    'Basilicata': { latMin: 39.90, latMax: 41.13, lngMin: 15.34, lngMax: 16.86 },
    'Calabria': { latMin: 37.91, latMax: 40.15, lngMin: 15.63, lngMax: 17.22 },
    'Sicilia': { latMin: 36.65, latMax: 38.82, lngMin: 12.43, lngMax: 15.65 },
    'Sardegna': { latMin: 38.85, latMax: 41.32, lngMin: 8.13, lngMax: 9.83 },
  };

  const getPositionWithTimeout = (timeoutMs = 6000): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, timeoutMs);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(pos);
          }
        },
        () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(null);
          }
        },
        { timeout: timeoutMs, maximumAge: 0, enableHighAccuracy: true }
      );
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCaptureOpen(false);
    showAlert("Analisi del contesto e foto in corso...", "Sblocco", false);

    const targetBeer = beers.find((b) => b.brand === scannerConfig.brand);

    try {
      const pos = await getPositionWithTimeout(10000);
      let isShiny = false;
      let lat: number | null = null;
      let lng: number | null = null;

      if (pos) {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        isShiny = await checkShinyStatusWithTimeout(lat, lng, targetBeer);
      }

      processPhoto(file, isShiny, lat, lng);
    } catch (err) {
      console.error("Error in handlePhotoUpload:", err);
      processPhoto(file, false, null, null);
    } finally {
      e.target.value = '';
    }
  };

  const checkShinyStatusWithTimeout = async (lat: number, lng: number, targetBeer: any) => {
    try {
      const shinyPromise = checkShinyStatus(lat, lng, targetBeer);
      const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000));
      return await Promise.race([shinyPromise, timeoutPromise]);
    } catch (e) {
      console.error("Shiny check timeout/error:", e);
      return false;
    }
  };

  const checkShinyStatus = async (lat: number, lng: number, targetBeer: any) => {
    let isShiny = false;
    if (targetBeer && countryCoordinates[targetBeer.country]) {
      const bounds = countryCoordinates[targetBeer.country];
      if (lat >= bounds.latMin && lat <= bounds.latMax && lng >= bounds.lngMin && lng <= bounds.lngMax) {
        if (targetBeer.country === 'Italia' && targetBeer.regione) {
          const regName = targetBeer.regione;
          const regBounds = italianRegionBounds[regName];

          // 1. Direct Region Polygon Boundary Check (Instant & Offline Capable)
          if (regBounds && lat >= regBounds.latMin && lat <= regBounds.latMax && lng >= regBounds.lngMin && lng <= regBounds.lngMax) {
            isShiny = true;
          } else {
            // 2. High-Precision Reverse Geocoding via BigDataCloud & Nominatim APIs
            try {
              const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=it`);
              const bdcData = await bdcRes.json();
              const bdcRegion = bdcData.principalSubdivision || bdcData.localityInfo?.administrative?.[1]?.name || "";
              if (normalizeStr(bdcRegion).includes(normalizeStr(regName))) {
                isShiny = true;
              } else {
                const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
                const nomData = await nomRes.json();
                const currentRegion = nomData.address?.state || nomData.address?.region || nomData.address?.county || nomData.address?.province || "";
                if (normalizeStr(currentRegion).includes(normalizeStr(regName))) {
                  isShiny = true;
                }
              }
            } catch (e) {
              console.log("Reverse geocode error:", e);
            }
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
    reader.onerror = () => {
      hideAlert();
      showAlert("Errore durante la lettura della foto. Riprova.", "Errore");
    };
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        hideAlert();
        showAlert("Impossibile elaborare la foto selezionata.", "Errore");
      };
      img.onload = () => {
        try {
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
          if (!ctx) {
            hideAlert();
            showAlert("Errore canvas durante la compressione.", "Errore");
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);

          const proceedWithUpload = (safetyOk: boolean, reason?: string) => {
            if (!safetyOk) {
              hideAlert();
              showAlert(
                reason || 'L\'immagine selezionata contiene contenuto non appropriato o esplicito e non può essere caricata.',
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
          };

          checkImageSafety(compressedDataUrl)
            .then((safety) => {
              proceedWithUpload(safety.isSafe, safety.reason);
            })
            .catch((err) => {
              console.error("Image safety check exception:", err);
              proceedWithUpload(true);
            });
        } catch (err: any) {
          hideAlert();
          showAlert("Errore durante l'elaborazione dell'immagine: " + err.message, "Errore");
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

      // Send tag_requests in Realtime Database to tagged friends!
      if (Array.isArray(taggedFriendsList) && taggedFriendsList.length > 0) {
        taggedFriendsList.forEach(async (friendNick) => {
          try {
            const reqRef = push(ref(db, `tag_requests/${friendNick}`));
            await set(reqRef, {
              requestId: reqRef.key,
              fromUser: currentUserNick,
              fromDisplayName: globalDisplayNames[currentUserNick] || currentUserNick,
              brand: formattedBrand,
              variant: formattedVariant,
              photo: canvasBase64,
              isShiny,
              lat: lat || null,
              lng: lng || null,
              timestamp: Date.now(),
              status: 'pending',
            });
          } catch (e) {
            console.error("Error creating tag request for friend:", e);
          }
        });
      }

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

  // 24h Instagram-style Story Studio Creation
  const handleOpenStoryUpload = () => {
    setIsStoryEditorOpen(true);
  };

  const handlePublishStory = async (storyData: {
    mediaUrl: string;
    isVideo: boolean;
    filterId: string;
    overlayText: string;
    textColor: string;
    textStyle: string;
    musicTrackId: string;
    musicTitle: string;
    musicAudioUrl: string;
  }) => {
    setIsStoryEditorOpen(false);
    showAlert("Pubblicazione storia nel Pub in corso...", "Storia 24h", false);

    try {
      const newStoryRef = push(ref(db, 'pub_stories/main_pub'));
      await set(newStoryRef, {
        postId: newStoryRef.key,
        pubId: 'main_pub',
        user: currentUserNick,
        brand: 'Storia del Pub',
        variant: storyData.isVideo ? 'Video al volo' : 'Foto al volo',
        photo: storyData.mediaUrl,
        mediaUrl: storyData.mediaUrl,
        isVideo: storyData.isVideo,
        filterId: storyData.filterId,
        overlayText: storyData.overlayText,
        textColor: storyData.textColor,
        textStyle: storyData.textStyle,
        musicTrackId: storyData.musicTrackId,
        musicTitle: storyData.musicTitle,
        musicAudioUrl: storyData.musicAudioUrl,
        time: Date.now(),
        isShiny: false,
        isShared: false,
        isStory: true,
        likes: {},
      });
      hideAlert();
      showAlert("Storia pubblicata con successo nel Pub! Visibile per 24 ore 🍺", "Storia Pubblicata");
      playPopSound();
    } catch (e: any) {
      hideAlert();
      showAlert("Errore durante la pubblicazione della storia: " + e.message, "Errore");
    }
  };

  const handleStoryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStoryCaptureOpen(false);
    showAlert("Elaborazione foto storia in corso...", "Storia 24h", false);

    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 750;
            let width = img.width;
            let height = img.height;
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
            if (!ctx) {
              hideAlert();
              showAlert("Errore durante la creazione dell'immagine.", "Errore");
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);

            checkImageSafety(compressedDataUrl)
              .then(async (safety) => {
                if (!safety.isSafe) {
                  hideAlert();
                  showAlert(safety.reason || "L'immagine contiene contenuti non appropriati.", "Foto Rifiutata");
                  return;
                }
                const newStoryRef = push(ref(db, 'pub_stories/main_pub'));
                await set(newStoryRef, {
                  postId: newStoryRef.key,
                  pubId: 'main_pub',
                  user: currentUserNick,
                  brand: 'Storia del Pub',
                  variant: 'Foto al volo',
                  photo: compressedDataUrl,
                  time: Date.now(),
                  isShiny: false,
                  isShared: false,
                  isStory: true,
                  likes: {},
                });
                hideAlert();
                showAlert("Storia pubblicata nel Pub! Visibile per 24 ore 🍺 (0 pt)", "Storia Pubblicata");
                playPopSound();
              })
              .catch(async () => {
                const newStoryRef = push(ref(db, 'pub_stories/main_pub'));
                await set(newStoryRef, {
                  postId: newStoryRef.key,
                  pubId: 'main_pub',
                  user: currentUserNick,
                  brand: 'Storia del Pub',
                  variant: 'Foto al volo',
                  photo: compressedDataUrl,
                  time: Date.now(),
                  isShiny: false,
                  isShared: false,
                  isStory: true,
                  likes: {},
                });
                hideAlert();
                showAlert("Storia pubblicata nel Pub! Visibile per 24 ore 🍺 (0 pt)", "Storia Pubblicata");
                playPopSound();
              });
          } catch (err: any) {
            hideAlert();
            showAlert("Errore durante l'elaborazione della storia: " + err.message, "Errore");
          }
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      hideAlert();
      showAlert("Errore durante il caricamento della foto.", "Errore");
    } finally {
      e.target.value = '';
    }
  };

  const handleShareToStory = async (postId: string) => {
    try {
      const post = globalPosts.find((p) => p.postId === postId);
      if (!post) return;

      const newStoryRef = push(ref(db, 'pub_stories/main_pub'));
      await set(newStoryRef, {
        postId: newStoryRef.key,
        pubId: 'main_pub',
        user: currentUserNick,
        brand: post.brand || 'Storia del Pub',
        variant: post.variant || 'Foto al volo',
        photo: post.photo,
        time: Date.now(),
        isShiny: false,
        isShared: false,
        isStory: true,
        likes: {},
      });

      showAlert("Post condiviso nelle Storie per 24 ore! 🍺", "Storia Pubblicata");
      playPopSound();
    } catch (e: any) {
      console.error("Error sharing post to story:", e);
      showAlert("Errore durante la condivisione nelle Storie.", "Errore");
    }
  };

  // Like operations (triggered doubletap or button clink)
  const handleToggleLike = async (postId: string, _imageContainer: HTMLElement | null) => {
    try {
      const likeRef = ref(db, `social_timeline/${postId}/likes/${currentUserNick}`);
      const snap = await get(likeRef);
      if (snap.exists()) {
        // RIMOZIONE BRINDISI: Silenzioso (nessun suono)
        await remove(likeRef);
      } else {
        // INSERIMENTO BRINDISI: Suona il brindisi
        playClinkSound();
        await set(likeRef, true);
      }
    } catch (e) {
      console.error("Error toggling like:", e);
    }
  };

  // Delete variant/checkin
  const handleDeleteVariant = (brand: string, variant: string, targetUser?: string) => {
    const userToEdit = targetUser || currentUserNick;
    const formattedB = formatBeerTitle(brand);
    const formattedV = formatBeerTitle(variant);
    const uniqueId = `${formattedB}-${formattedV}`;
    showConfirm(
      `Vuoi davvero eliminare lo sblocco per ${brand} - ${variant}${targetUser ? ` dell'utente ${targetUser}` : ''}?`,
      'Conferma Eliminazione',
      async () => {
        try {
          await remove(ref(db, `pokedex_profiles/${userToEdit}/${uniqueId}`));
          
          // remove matching posts in community feed as well
          const timelineSnap = await get(ref(db, 'social_timeline'));
          if (timelineSnap.exists()) {
            const removes: Promise<void>[] = [];
            timelineSnap.forEach((child) => {
              const p = child.val();
              if (
                p.user === userToEdit &&
                formatBeerTitle(p.brand) === formattedB &&
                formatBeerTitle(p.variant) === formattedV
              ) {
                removes.push(remove(ref(db, `social_timeline/${child.key}`)));
              }
            });
            await Promise.all(removes);
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
    const formattedB = formatBeerTitle(brand);
    const formattedV = formatBeerTitle(variant);
    const uniqueId = `${formattedB}-${formattedV}`;
    const postRef = ref(db, `social_timeline/${postId}`);

    get(postRef).then((postSnap) => {
      let isCurrentUserParticipant = false;
      let participants: string[] = [];

      if (postSnap.exists()) {
        const postVal = postSnap.val();
        participants = Array.from(
          new Set([
            postVal.user,
            ...(Array.isArray(postVal.taggedFriends) ? postVal.taggedFriends.filter(Boolean) : []),
            ...(postVal.taggedFriend ? postVal.taggedFriend.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          ])
        );

        isCurrentUserParticipant = participants.some(
          (p) => p.toLowerCase() === currentUserNick.toLowerCase()
        );
      }

      // 1. If current user is a participant in the post (even if Admin):
      // Remove ONLY current user's name and pokedex entry from the shared post.
      if (isCurrentUserParticipant) {
        showConfirm(
          `Vuoi davvero rimuovere la tua partecipazione a questo post (${brand} - ${variant})?`,
          'Rimuovi dal tuo Profilo',
          async () => {
            try {
              // Remove currentUserNick's pokedex entry & rating
              await remove(ref(db, `pokedex_profiles/${currentUserNick}/${uniqueId}`));
              await remove(ref(db, `social_timeline/${postId}/ratings/${currentUserNick}`));

              const remainingParticipants = participants.filter(
                (p) => p.toLowerCase() !== currentUserNick.toLowerCase()
              );

              if (remainingParticipants.length > 0) {
                // Post still has other participants! Update post for remaining participants
                const newAuthor = remainingParticipants[0];
                const newTagged = remainingParticipants.slice(1);

                await update(postRef, {
                  user: newAuthor,
                  taggedFriends: newTagged,
                  taggedFriend: newTagged.join(', '),
                  isShared: newTagged.length > 0,
                });

                await recalculateTotalScore(currentUserNick);
                showAlert('Post rimosso dal tuo profilo. La bevuta rimane visibile per gli altri partecipanti.');
              } else {
                // Last participant deleted the post -> delete entire post from timeline
                await remove(postRef);
                await remove(ref(db, `flagged_posts/${postId}`));
                await recalculateTotalScore(currentUserNick);
                showAlert('Post rimosso con successo.');
              }
            } catch (err: any) {
              showAlert(err.message, 'Errore');
            }
          }
        );
        return;
      }

      // 2. If current user is NOT a participant and is an Admin:
      // Perform full Admin deletion of someone else's post.
      if (isAdminUser) {
        const targetPostUser = postUser || (postSnap.exists() ? postSnap.val().user : 'utente');
        showConfirm(
          `Vuoi davvero eliminare come ADMIN il post di @${targetPostUser} (${brand} - ${variant})?`,
          'Eliminazione Admin',
          async () => {
            try {
              if (postSnap.exists()) {
                const postVal = postSnap.val();
                const allParts: string[] = Array.from(
                  new Set([
                    postVal.user,
                    ...(Array.isArray(postVal.taggedFriends) ? postVal.taggedFriends.filter(Boolean) : []),
                    ...(postVal.taggedFriend ? postVal.taggedFriend.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                  ])
                );

                // Remove pokedex entries for all participants of this post
                for (const pNick of allParts) {
                  await remove(ref(db, `pokedex_profiles/${pNick}/${uniqueId}`));
                  await recalculateTotalScore(pNick);
                }
              } else if (targetPostUser) {
                await remove(ref(db, `pokedex_profiles/${targetPostUser}/${uniqueId}`));
                await recalculateTotalScore(targetPostUser);
              }

              // Remove post from timeline & flagged posts
              await remove(postRef);
              await remove(ref(db, `flagged_posts/${postId}`));

              showAlert(`Post di @${targetPostUser} eliminato con successo dall'amministratore.`, 'Post Eliminato');
            } catch (err: any) {
              showAlert(err.message, 'Errore');
            }
          }
        );
        return;
      }

      // 3. Fallback for regular non-participant user
      showConfirm(
        `Vuoi davvero eliminare lo sblocco di ${brand} - ${variant}?`,
        'Conferma Eliminazione',
        async () => {
          try {
            await remove(ref(db, `pokedex_profiles/${currentUserNick}/${uniqueId}`));
            await recalculateTotalScore(currentUserNick);
            showAlert('Post rimosso dal tuo profilo.');
          } catch (err: any) {
            showAlert(err.message, 'Errore');
          }
        }
      );
    });
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
      const formattedB = formatBeerTitle(brand);
      const formattedV = formatBeerTitle(variant);
      const uniqueId = `${formattedB}-${formattedV}`;
      await remove(ref(db, `social_timeline/${postId}`));
      await remove(ref(db, `flagged_posts/${postId}`));
      
      const timelineSnap = await get(ref(db, 'social_timeline'));
      let hasRemainingPost = false;
      if (timelineSnap.exists()) {
        timelineSnap.forEach((child) => {
          if (child.key !== postId) {
            const p = child.val();
            if (
              p.user === postUser &&
              formatBeerTitle(p.brand) === formattedB &&
              formatBeerTitle(p.variant) === formattedV
            ) {
              hasRemainingPost = true;
            }
          }
        });
      }
      if (!hasRemainingPost) {
        await remove(ref(db, `pokedex_profiles/${postUser}/${uniqueId}`));
      }

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

    setAvatarSelectorOpen(false);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setCropImageSrc(uploadEvent.target.result as string);
        setCropOpen(true);
      }
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

  const handleOpenRatingForBeer = (brand: string, variant: string, photo?: string) => {
    setUnlockRatingModalState({
      isOpen: true,
      brand,
      variant,
      photo,
    });
  };

  const handleRateBeer = async (brand: string, variant: string, rating: number) => {
    if (!currentUserNick) return;
    try {
      const uniqueId = `${brand}-${variant}`;
      await update(ref(db, `pokedex_profiles/${currentUserNick}/${uniqueId}`), { rating });

      const postsSnap = await get(ref(db, 'social_timeline'));
      if (postsSnap.exists()) {
        const postsData = postsSnap.val();
        const updatesObj: Record<string, any> = {};
        Object.entries(postsData).forEach(([postId, p]: [string, any]) => {
          if (p && p.brand === brand && p.variant === variant) {
            const isParticipant =
              p.user === currentUserNick ||
              (Array.isArray(p.taggedFriends) && p.taggedFriends.includes(currentUserNick)) ||
              (typeof p.taggedFriend === 'string' && p.taggedFriend.includes(currentUserNick));

            if (isParticipant) {
              updatesObj[`social_timeline/${postId}/ratings/${currentUserNick}`] = rating;
              if (p.user === currentUserNick) {
                updatesObj[`social_timeline/${postId}/rating`] = rating;
              }
            }
          }
        });
        if (Object.keys(updatesObj).length > 0) {
          await update(ref(db), updatesObj);
        }
      }
    } catch (err) {
      console.error("Error rating beer:", err);
    }
  };

  // Public Profile View
  const handleOpenPublicProfile = async (username: string) => {
    if (!username) return;
    if (username.toLowerCase() === currentUserNick.toLowerCase()) {
      navigateTo('page-profile');
      return;
    }
    setPubProfileBackPage(currentPage);
    setPubProfileUser(username);
    navigateTo('page-public-profile');

    try {
      await recalculateTotalScore(username);
      const snap = await get(ref(db, `pokedex_profiles/${username}`));
      const dex = snap.val() || {};
      setPubProfileDex(dex);

      const scoreSnap = await get(ref(db, `leaderboard_scores/${username}`));
      const scoreVal = scoreSnap.val() || 0;
      setPubProfileScore(scoreVal);
    } catch (e) {
      console.error("Error loading public profile:", e);
    }
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

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // Check 3-month (90 days) nickname change restriction
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
    try {
      const lastChangeSnap = await get(ref(db, `users_last_nickname_change/${uid}`));
      if (lastChangeSnap.exists()) {
        const lastChangeTime = lastChangeSnap.val();
        if (typeof lastChangeTime === 'number') {
          const elapsedTime = Date.now() - lastChangeTime;
          if (elapsedTime < NINETY_DAYS_MS) {
            const remainingDays = Math.ceil((NINETY_DAYS_MS - elapsedTime) / (24 * 60 * 60 * 1000));
            showAlert(
              `Puoi cambiare il tuo nickname univoco solo una volta ogni 3 mesi (90 giorni).\nPotrai modificarlo di nuovo tra ${remainingDays} ${remainingDays === 1 ? 'giorno' : 'giorni'}.`,
              "Cambio Nickname Limitato"
            );
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Error checking last nickname change timestamp:", e);
    }

    if (/[.#$\[\]]/.test(nick)) {
      showAlert("Il nickname non può contenere punti (.) o simboli speciali come #, $, [, ]", "Nickname Non Valido");
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
          if (uKey === uid) return false;
          return (val || '').toString().trim().toLowerCase() === nick.toLowerCase();
        });
        if (isTaken) {
          showAlert("Questo nickname è già stato preso da un altro utente. Scegli un nickname univoco diverso!", "Nickname Già In Uso");
          return;
        }
      }

      const updates: any = {};
      updates[`users_directory/${uid}`] = nick;
      updates[`users_last_nickname_change/${uid}`] = Date.now();
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



  const mainTabs = ['page-home', 'page-explore', 'page-leaderboard', 'page-social', 'page-profile'];
  const isMainTab = mainTabs.includes(currentPage);
  const activeIndex = mainTabs.indexOf(currentPage) !== -1 ? mainTabs.indexOf(currentPage) : 0;

  const handlePullToRefresh = async () => {
    try {
      recalculateAllScores();
      await new Promise((res) => setTimeout(res, 500));
    } catch (e) {
      console.error("Errore durante il refresh:", e);
    }
  };

  return (
    <PullToRefreshHandler onRefresh={handlePullToRefresh}>
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

      {/* Hidden Beer Capture Inputs (Always mounted so onChange works reliably across all mobile devices) */}
      <input
        type="file"
        id="beerCaptureCamera"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />
      <input
        type="file"
        id="beerCaptureGallery"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />

      {/* Hidden Story Capture Inputs (No barcode required, 24h duration, 0 points) */}
      <input
        type="file"
        id="storyCaptureCamera"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleStoryPhotoUpload}
      />
      <input
        type="file"
        id="storyCaptureGallery"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleStoryPhotoUpload}
      />

      {/* Story Photo Upload Trigger Modal */}
      {storyCaptureOpen && (
        <div className="auth-modal" style={{ zIndex: 18000 }}>
          <div className="auth-container" style={{ maxWidth: '400px', width: '90%', boxSizing: 'border-box', margin: '0 auto' }}>
            <h3 style={{ marginTop: 0, color: 'var(--dark)', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#F59E0B' }}>auto_awesome</span> Crea Storia (24h)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
              Scatta o carica qualsiasi foto di una birra. Le storie durano 24 ore e non richiedono la scansione del codice a barre (0 pt).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <button 
                className="btn-main" 
                onClick={() => {
                  document.getElementById('storyCaptureCamera')?.click();
                }}
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
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  document.getElementById('storyCaptureGallery')?.click();
                }}
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
              </button>
            </div>
            <button className="btn-secondary" onClick={() => setStoryCaptureOpen(false)} style={{ justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
              Annulla
            </button>
          </div>
        </div>
      )}

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
              <button 
                className="btn-main" 
                onClick={() => {
                  document.getElementById('beerCaptureCamera')?.click();
                }}
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
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  document.getElementById('beerCaptureGallery')?.click();
                }}
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
              </button>
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

      {/* Hidden Avatar Inputs (Always mounted so onChange works reliably) */}
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

      {/* Avatar selectors camera / gallery */}
      {avatarSelectorOpen && (
        <div className="auth-modal" style={{ zIndex: 20500 }}>
          <div className="auth-container" style={{ maxWidth: '320px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: 'var(--dark)', marginBottom: '20px' }}>Cambia Foto Profilo</h3>

            <button
              className="btn-main"
              onClick={() => {
                document.getElementById('avatarInputCamera')?.click();
              }}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '10px', gap: '8px' }}
            >
              <span className="material-symbols-outlined">photo_camera</span> Scatta Foto
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
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

            {/* Row Condividi Profilo & Invita Amici */}
            <div
              className="settings-row"
              onClick={() => {
                setSettingsOpen(false);
                setShareProfileModalOpen(true);
              }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined icon" style={{ color: '#F59E0B' }}>
                  person_add
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div className="row-label" style={{ fontWeight: 800 }}>Condividi Profilo & Invita Amici</div>
                  <div className="row-desc">
                    Invia il tuo link personale su WhatsApp o Instagram senza codici
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined" style={{ color: '#94A3B8', fontSize: '20px' }}>
                chevron_right
              </span>
            </div>

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
                  <div className="row-desc">L'identificativo unico per taggare e farsi trovare (modificabile max 1 volta ogni 3 mesi)</div>
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

            {/* Row Tutorial App */}
            <div
              className="settings-row"
              onClick={() => {
                setSettingsOpen(false);
                setTutorialOpen(true);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <span className="material-symbols-outlined icon" style={{ color: 'var(--primary-dark)', flexShrink: 0 }}>
                  school
                </span>
                <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                  <div className="row-label">Rivedi Tutorial App 🎓</div>
                  <div className="row-desc">Riapri la guida interattiva per scoprire tutte le funzionalità</div>
                </div>
              </div>
              <span className="material-symbols-outlined chevron" style={{ flexShrink: 0, marginLeft: '8px' }}>chevron_right</span>
            </div>

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
            
            {/* Install PWA Row */}
            <div className="settings-row" onClick={handleInstallAppClick} style={{ background: '#FFFBEB', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined icon" style={{ color: '#D97706' }}>download</span>
                <div>
                  <div className="row-label" style={{ color: '#92400E' }}>Installa L'App su Dispositivo</div>
                  <div className="row-desc" style={{ color: '#B45309' }}>Aggiungi POP IT alla schermata Home (Chrome PWA)</div>
                </div>
              </div>
              <span className="material-symbols-outlined chevron" style={{ color: '#F59E0B' }}>install_mobile</span>
            </div>

            {/* Info row */}
            <div className="settings-row-expanded" style={{ textAlign: 'center', background: '#FAFAFC', borderBottom: '1px solid rgba(226,232,240,0.4)', padding: '16px 12px' }}>
              <div style={{ marginBottom: '6px' }}>
                <img src="/pop-it-logo.png" alt="POP IT Logo" style={{ width: '80px', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--dark)' }}>
                POP IT App v3.3.0
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

      {/* Floating PWA Install Banner */}
      {showInstallBanner && (
        <div
          style={{
            position: 'fixed',
            top: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '440px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.4)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/pop-it-logo.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', background: '#FFFFFF', padding: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC' }}>Installa POP IT</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Aggiungi l'app alla Schermata Home</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleInstallAppClick}
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              }}
            >
              Installa
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER CONTENT VIEW */}
      <div className="main-content">
        {/* Main 5 Tabs Horizontal Slider */}
        <div className={`page-view ${isMainTab ? 'active' : ''}`}>
          <div className="main-tabs-wrapper">
            <div
              className={`main-tabs-slider-container ${isDragging ? 'is-transitioning' : ''}`}
              style={{
                transform: isDragging
                  ? `translateX(calc(-${activeIndex * 20}% + ${dragOffset}px))`
                  : `translateX(-${activeIndex * 20}%)`,
                transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              onTouchStart={handleMainTouchStart}
              onTouchMove={handleMainTouchMove}
              onTouchEnd={handleMainTouchEnd}
              onTouchCancel={handleMainTouchEnd}
            >
              {/* Page 0: Home */}
              <div className={`main-tab-slide ${activeIndex === 0 ? 'active' : ''}`}>
                {currentUser && (
                  <HomeView
                    currentUserNick={currentUserNick}
                    currentUserDisplayName={globalDisplayNames[currentUserNick]}
                    currentUserAvatar={globalAvatars[currentUserNick]}
                    posts={globalPosts}
                    leaderboardScores={globalLeaderboardScores}
                    myFriendsList={myFriendsList}
                    myReceivedRequests={myReceivedRequests}
                    onNavigate={navigateTo}
                    onNavigateToExplore={handleNavigateToExplore}
                    getUserRankTitle={getUserRankTitle}
                    myPokedex={myPokedex}
                    allBeersCatalog={allBeersCatalog}
                    onInitUnlock={handleInitUnlock}
                    onOpenScanner={() => requestPermission('camera', () => setScannerConfig({ open: true, brand: '', variant: '' }))}
                    onOpenPublicProfile={handleOpenPublicProfile}
                    globalUserPrivacy={globalUserPrivacy}
                    isAdminUser={isAdminUser}
                    onOpenUserStory={handleOpenUserStory}
                    onSendFeedback={handleSendFeedback}
                  />
                )}
              </div>

              {/* Page 1: Explore */}
              <div className={`main-tab-slide ${activeIndex === 1 ? 'active' : ''}`}>
                {currentUser && (
                  <ExploreView
                    myPokedex={myPokedex}
                    allPokedexProfiles={allPokedexProfiles}
                    globalPosts={globalPosts}
                    allBeersCatalog={allBeersCatalog}
                    onInitUnlock={handleInitUnlock}
                    onDeleteVariant={handleDeleteVariant}
                    onOpenProposeModal={(search) => {
                      handleOpenProposeModal(search);
                    }}
                    onRateBeer={handleRateBeer}
                    isAdminUser={isAdminUser}
                    onDeleteCustomBeerCatalog={handleDeleteCustomBeerCatalog}
                    initialSearchTerm={exploreSearchTerm}
                  />
                )}
              </div>

              {/* Page 2: Leaderboard */}
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

              {/* Page 3: Social Pub */}
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
                    allPokedexProfiles={allPokedexProfiles}
                    globalUserPrivacy={globalUserPrivacy}
                    onRateBeer={handleRateBeer}
                    onOpenRatingModal={handleOpenRatingForBeer}
                    onToggleLike={handleToggleLike}
                    onDeletePost={handleDeletePost}
                    onReportFakePost={handleReportFakePost}
                    onOpenPublicProfile={handleOpenPublicProfile}
                    onOpenScanner={() => requestPermission('camera', () => setScannerConfig({ open: true, brand: '', variant: '' }))}
                    onOpenStoryUpload={() => requestPermission('camera', handleOpenStoryUpload)}
                    onShareToStory={handleShareToStory}
                    getAvatarZoomProps={getAvatarZoomProps}
                    onOpenUserStory={handleOpenUserStory}
                  />
                )}
              </div>

              {/* Page 4: Profile */}
              <div className={`main-tab-slide ${activeIndex === 4 ? 'active' : ''}`}>
                {currentUser && (
                  <ProfileView
                    currentUserNick={currentUserNick}
                    currentUserDisplayName={globalDisplayNames[currentUserNick]}
                    isAdminUser={isAdminUser}
                    myPokedex={myPokedex}
                    globalAvatars={globalAvatars}
                    leaderboardScores={globalLeaderboardScores}
                    allBeersCatalog={allBeersCatalog}
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
                    onOpenAdminProposals={() => {
                      setAdminModalTab('proposals');
                      setSubPageBackPage('page-profile');
                      navigateTo('page-admin');
                    }}
                    pendingProposalsCount={(beerProposals || []).filter((p: BeerProposalItem) => p && p.status === 'pending').length}
                    onOpenAdminReports={() => {
                      setAdminModalTab('flagged');
                      setSubPageBackPage('page-profile');
                      navigateTo('page-admin');
                    }}
                    flaggedPostsCount={Object.keys(flaggedPosts || {}).length}
                    onOpenAdminUsers={() => {
                      setAdminModalTab('users');
                      setSubPageBackPage('page-profile');
                      navigateTo('page-admin');
                    }}
                    onOpenAdminFeedback={() => {
                      setAdminModalTab('feedback');
                      setSubPageBackPage('page-profile');
                      navigateTo('page-admin');
                    }}
                    unreadFeedbackCount={Object.values(appFeedbacks || {}).filter((f: any) => f && f.status !== 'read').length}
                    onRateBeer={handleRateBeer}
                    myReceivedRequests={myReceivedRequests}
                    onNavigateToFriends={() => navigateTo('page-friends')}
                    myTagRequests={myTagRequests}
                    onOpenTagRequest={(req) => setActiveTagRequestModal(req)}
                    onChangeAvatar={() => setAvatarSelectorOpen(true)}
                    onOpenScanner={() => requestPermission('camera', () => setScannerConfig({ open: true, brand: '', variant: '' }))}
                    onOpenStoryUpload={() => requestPermission('camera', handleOpenStoryUpload)}
                    onOpenUserStory={handleOpenUserStory}
                    onOpenAdminMoveModal={handleOpenAdminMoveModal}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Public Profile */}
        <div className={`page-view ${currentPage === 'page-public-profile' ? 'active' : ''}`}>
          {currentPage === 'page-public-profile' ? (
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
              allBeersCatalog={allBeersCatalog}
              onOpenUserStory={handleOpenUserStory}
              onOpenPostDetail={(uname, pid) => {
                setDetailViewUser(uname);
                setDetailViewPostId(pid);
                setDetailViewBackPage('page-public-profile');
                navigateTo('page-user-posts-detail');
              }}
              isAdminUser={isAdminUser}
              onDeleteVariant={handleDeleteVariant}
              onOpenAdminMoveModal={handleOpenAdminMoveModal}
              isPrivate={(() => {
                if (!globalUserPrivacy || !pubProfileUser) return false;
                const lower = pubProfileUser.toLowerCase();
                const matchKey = Object.keys(globalUserPrivacy).find((k) => k.toLowerCase() === lower);
                return matchKey ? globalUserPrivacy[matchKey] === true : false;
              })()}
              isFriend={Array.isArray(myFriendsList) && pubProfileUser ? myFriendsList.some((f) => f.toLowerCase() === pubProfileUser.toLowerCase()) : false}
              currentUserNick={currentUserNick}
              myFriendsList={myFriendsList}
              mySentRequests={mySentRequests}
              myReceivedRequests={myReceivedRequests}
              onAddFriend={handleAddFriend}
              onRemoveFriend={handleRemoveFriend}
              onAcceptRequest={handleAcceptRequest}
              onCancelSentRequest={handleCancelSentRequest}
              onDeleteUserProfile={handleDeleteUserProfile}
              onChangeUserNicknameByAdmin={handleAdminChangeUserNickname}
            />
          ) : null}
        </div>

        {/* Page Map */}
        <div className={`page-view ${currentPage === 'page-map-view' ? 'active' : ''}`}>
          {currentPage === 'page-map-view' && (
            <div id="page-map-view">
              <header className="hero" style={{ position: 'relative' }}>
                <FoamBubbles />
                <button
                  onClick={() => navigateTo(subPageBackPage || 'page-home')}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    color: 'var(--dark)',
                    fontWeight: 800,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                  Indietro
                </button>
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
        <div className={`page-view ${currentPage === 'page-friends' ? 'active' : ''}`}>
          {currentPage === 'page-friends' ? (
            <FriendsView
              myFriendsList={myFriendsList}
              myReceivedRequests={myReceivedRequests}
              mySentRequests={mySentRequests}
              myRejectedRequests={myRejectedRequests}
              globalAvatars={globalAvatars}
              globalDisplayNames={globalDisplayNames}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onCancelSentRequest={handleCancelSentRequest}
              onRemoveFriend={handleRemoveFriend}
              onRestoreRejectedRequest={handleRestoreRejectedRequest}
              onOpenPublicProfile={handleOpenPublicProfile}
              onBack={() => navigateTo(subPageBackPage || 'page-home')}
            />
          ) : null}
        </div>

        {/* Page Rules */}
        <div className={`page-view ${currentPage === 'page-rules' ? 'active' : ''}`}>
          {currentPage === 'page-rules' ? <RulesView onBack={() => navigateTo(subPageBackPage || 'page-home')} /> : null}
        </div>

        {/* Page User Posts Detail */}
        <div className={`page-view ${currentPage === 'page-user-posts-detail' ? 'active' : ''}`}>
          {currentPage === 'page-user-posts-detail' ? (
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
              allPokedexProfiles={allPokedexProfiles}
              onDeletePost={handleDeletePost}
              onReportFakePost={handleReportFakePost}
              onOpenPublicProfile={handleOpenPublicProfile}
              isAdminUser={isAdminUser}
              isPrivate={(() => {
                if (!globalUserPrivacy || !detailViewUser) return false;
                const lower = detailViewUser.toLowerCase();
                const matchKey = Object.keys(globalUserPrivacy).find((k) => k.toLowerCase() === lower);
                return matchKey ? globalUserPrivacy[matchKey] === true : false;
              })()}
              isFriend={Array.isArray(myFriendsList) && detailViewUser ? myFriendsList.some((f) => f.toLowerCase() === detailViewUser.toLowerCase()) : false}
            />
          ) : null}
        </div>

        {/* Page Admin Panel */}
        <div className={`page-view ${currentPage === 'page-admin' ? 'active' : ''}`}>
          {currentPage === 'page-admin' ? (
            <AdminView
              onBack={() => {
                const backTarget = (subPageBackPage && subPageBackPage !== 'page-admin' && subPageBackPage !== 'page-public-profile') ? subPageBackPage : 'page-profile';
                navigateTo(backTarget);
              }}
              initialTab={adminModalTab}
              proposals={beerProposals}
              onAcceptProposal={handleAcceptProposal}
              onRejectProposal={handleRejectProposal}
              globalAvatars={globalAvatars}
              globalDisplayNames={globalDisplayNames}
              flaggedPosts={flaggedPosts}
              onRemoveFlaggedPost={handleRemoveFlaggedPost}
              onDismissFlaggedPost={handleDismissFlaggedPost}
              onDeleteUserProfile={handleDeleteUserProfile}
              onRecalculateUserScore={recalculateTotalScore}
              onOpenPublicProfile={(uname) => {
                setPubProfileUser(uname);
                setPubProfileBackPage('page-admin');
                navigateTo('page-public-profile');
              }}
              leaderboardScores={globalLeaderboardScores}
              allPokedexProfiles={allPokedexProfiles}
              feedbacks={appFeedbacks}
              onDeleteFeedback={handleDeleteFeedback}
              onMarkFeedbackRead={handleMarkFeedbackRead}
              targetUsername={adminMoveTargetUser}
              initialOldKey={adminMoveInitialOldKey}
              allBeersCatalog={allBeersCatalog}
              onConfirmMove={handleAdminMoveLoggedBeer}
            />
          ) : null}
        </div>
      </div>

      {/* FLOATING NAVIGATION CAP BAR */}
      {currentUser && (() => {
        const getActiveBottomNavTab = () => {
          const mainTabs = ['page-home', 'page-explore', 'page-leaderboard', 'page-social', 'page-profile'];
          if (mainTabs.includes(currentPage)) {
            return currentPage;
          }
          if (currentPage === 'page-public-profile') {
            return pubProfileBackPage || 'page-leaderboard';
          }
          if (currentPage === 'page-user-posts-detail') {
            return detailViewBackPage || 'page-profile';
          }
          return subPageBackPage || 'page-home';
        };

        const activeBottomTab = getActiveBottomNavTab();

        return (
          <nav className="bottom-nav">
            <div
              className={`nav-item ${activeBottomTab === 'page-home' ? 'active' : ''}`}
              onClick={() => navigateTo('page-home')}
            >
              <div className="nav-icon">
                <span className="material-symbols-outlined">home</span>
              </div>
              <div className="nav-text">Home</div>
            </div>
            <div
              className={`nav-item ${activeBottomTab === 'page-explore' ? 'active' : ''}`}
              onClick={() => navigateTo('page-explore')}
            >
              <div className="nav-icon">
                <span className="material-symbols-outlined">search</span>
              </div>
              <div className="nav-text">Esplora</div>
            </div>
            <div
              className={`nav-item ${activeBottomTab === 'page-leaderboard' ? 'active' : ''}`}
              onClick={() => navigateTo('page-leaderboard')}
            >
              <div className="nav-icon">
                <span className="material-symbols-outlined">leaderboard</span>
              </div>
              <div className="nav-text">Classifica</div>
            </div>
            <div
              className={`nav-item ${activeBottomTab === 'page-social' ? 'active' : ''}`}
              onClick={() => navigateTo('page-social')}
            >
              <div className="nav-icon">
                <span className="material-symbols-outlined">sports_bar</span>
              </div>
              <div className="nav-text">Pub</div>
            </div>
            <div
              className={`nav-item ${activeBottomTab === 'page-profile' ? 'active' : ''}`}
              onClick={() => navigateTo('page-profile')}
            >
              <div className="nav-icon" style={{ position: 'relative' }}>
                <span className="material-symbols-outlined">person</span>
                {((isAdminUser && (beerProposals || []).filter((p: BeerProposalItem) => p && p.status === 'pending').length > 0) || (myTagRequests || []).length > 0) && (
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
        );
      })()}

      {/* Zoomed Profile Avatar modal */}
      {zoomedAvatarUrl && (
        <div
          onClick={() => {
            if (Date.now() - zoomOpenedAt.current > 250) {
              setZoomedAvatarUrl(null);
            }
          }}
          onTouchEnd={() => {
            if (Date.now() - zoomOpenedAt.current > 250) {
              setZoomedAvatarUrl(null);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            pointerEvents: 'auto',
            animation: 'fadeIn 0.2s ease-out',
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
              border: '4px solid var(--white)',
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'zoomIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            {zoomedAvatarUrl && zoomedAvatarUrl !== 'generic' ? (
              <img
                src={zoomedAvatarUrl}
                alt="Avatar Ingrandito"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '130px', color: '#888' }} onContextMenu={(e) => e.preventDefault()}>
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
        myFriendsList={myFriendsList}
        globalAvatars={globalAvatars}
        globalDisplayNames={globalDisplayNames}
        onSubmitProposal={handleProposeBeerSubmit}
      />



      {/* Clash of Clans Style Live App Tutorial */}
      <AppTutorialModal
        isOpen={tutorialOpen}
        onClose={handleCloseTutorial}
        onNavigate={(page) => navigateTo(page)}
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

      {/* Tag Request (Sblocco in Compagnia) Modal */}
      <TagRequestModal
        isOpen={activeTagRequestModal !== null || myTagRequests.length > 0}
        request={activeTagRequestModal || (myTagRequests.length > 0 ? myTagRequests[0] : null)}
        onClose={() => setActiveTagRequestModal(null)}
        onAccept={handleAcceptTagRequest}
        onReject={handleRejectTagRequest}
        myPokedex={myPokedex}
        globalDisplayNames={globalDisplayNames}
        globalAvatars={globalAvatars}
      />

      {/* Instagram-style 24h Story Studio Modal */}
      <StoryEditorModal
        isOpen={isStoryEditorOpen}
        onClose={() => setIsStoryEditorOpen(false)}
        onPublishStory={handlePublishStory}
      />

      {/* Global 24h Fullscreen Story Viewer */}
      {activeStoryViewerIndex !== null && (
        <StoryViewerModal
          isOpen={activeStoryViewerIndex !== null}
          stories={storyViewerQueue}
          initialIndex={activeStoryViewerIndex}
          currentUserNick={currentUserNick}
          globalAvatars={globalAvatars}
          globalDisplayNames={globalDisplayNames}
          allPokedexProfiles={allPokedexProfiles}
          onClose={() => setActiveStoryViewerIndex(null)}
          onToggleLike={handleToggleLike}
          onOpenPublicProfile={handleOpenPublicProfile}
          onDeleteStory={handleDeleteStory}
        />
      )}

      {/* Share Profile Modal */}
      <ShareProfileModal
        isOpen={shareProfileModalOpen}
        onClose={() => setShareProfileModalOpen(false)}
        currentUserNick={currentUserNick}
        displayName={globalDisplayNames[currentUserNick] || currentUserNick}
        avatarUrl={globalAvatars[currentUserNick]}
        userScore={globalLeaderboardScores[currentUserNick] || 0}
      />

      {/* Incoming Friend Invite Modal */}
      {friendInviteModal && (
        <FriendInviteModal
          isOpen={friendInviteModal.isOpen}
          inviterNick={friendInviteModal.inviterNick}
          inviterDisplayName={globalDisplayNames[friendInviteModal.inviterNick] || friendInviteModal.inviterNick}
          inviterAvatar={globalAvatars[friendInviteModal.inviterNick]}
          isLoggedIn={!!currentUserNick}
          onAccept={handleAcceptFriendInvite}
          onClose={() => {
            setFriendInviteModal(null);
            localStorage.removeItem('popit_pending_friend_invite');
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
          onOpenAuth={() => {
            setFriendInviteModal(null);
            setAuthOpen(true);
          }}
        />
      )}
    </PullToRefreshHandler>
  );
}
