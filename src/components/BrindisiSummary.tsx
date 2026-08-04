import React from 'react';

interface BrindisiSummaryProps {
  likes?: Record<string, boolean>;
  currentUserNick: string;
  globalDisplayNames?: Record<string, string>;
  globalAvatars?: Record<string, string>;
  onOpenPublicProfile: (username: string) => void;
}

export const BrindisiSummary: React.FC<BrindisiSummaryProps> = ({
  likes,
  currentUserNick,
  globalDisplayNames,
  globalAvatars = {},
  onOpenPublicProfile,
}) => {
  if (!likes) return null;

  // Filter only active likes (keys with truthy value)
  const likerNicks = Object.keys(likes).filter((nick) => Boolean(likes[nick]));

  if (likerNicks.length === 0) return null;

  // Put currentUserNick first if present
  const sortedNicks = [...likerNicks];
  if (currentUserNick && sortedNicks.includes(currentUserNick)) {
    sortedNicks.sort((a, b) => {
      if (a === currentUserNick) return -1;
      if (b === currentUserNick) return 1;
      return a.localeCompare(b);
    });
  } else {
    sortedNicks.sort((a, b) => a.localeCompare(b));
  }

  const maxDisplayed = 3;
  const displayedNicks = sortedNicks.slice(0, maxDisplayed);
  const othersCount = sortedNicks.length - displayedNicks.length;

  const getDisplayName = (nick: string) => {
    return globalDisplayNames?.[nick] || nick;
  };

  const renderUserLink = (nick: string) => (
    <strong
      key={nick}
      className="clickable-user"
      onClick={(e) => {
        e.stopPropagation();
        onOpenPublicProfile(nick);
      }}
      style={{ cursor: 'pointer', fontWeight: 700 }}
    >
      {getDisplayName(nick)}
    </strong>
  );

  return (
    <div
      className="post-brindisi-summary"
      style={{
        padding: '4px 16px 10px 16px',
        fontSize: '13px',
        color: 'var(--text-dark, #334155)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
        lineHeight: '1.4'
      }}
    >
      {/* Avatar Stack */}
      <div style={{ display: 'inline-flex', alignItems: 'center', marginRight: '2px' }}>
        {displayedNicks.map((nick, idx) => {
          const av = globalAvatars[nick];
          return (
            <div
              key={nick}
              onClick={(e) => {
                e.stopPropagation();
                onOpenPublicProfile(nick);
              }}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                marginLeft: idx > 0 ? '-7px' : '0',
                zIndex: 3 - idx,
                background: '#F1F5F9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {av ? (
                <img src={av} alt={nick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#64748B' }}>
                  person
                </span>
              )}
            </div>
          );
        })}
      </div>

      <span
        className="material-symbols-outlined"
        style={{
          fontSize: '16px',
          color: 'var(--primary-dark)',
          marginRight: '2px',
          verticalAlign: 'middle'
        }}
      >
        sports_bar
      </span>
      <span>
        {displayedNicks.length === 1 && (
          <>
            {renderUserLink(displayedNicks[0])} ha brindato
          </>
        )}
        {displayedNicks.length === 2 && (
          <>
            {renderUserLink(displayedNicks[0])} e {renderUserLink(displayedNicks[1])} hanno brindato
          </>
        )}
        {displayedNicks.length === 3 && othersCount === 0 && (
          <>
            {renderUserLink(displayedNicks[0])}, {renderUserLink(displayedNicks[1])} e {renderUserLink(displayedNicks[2])} hanno brindato
          </>
        )}
        {displayedNicks.length === 3 && othersCount > 0 && (
          <>
            {renderUserLink(displayedNicks[0])}, {renderUserLink(displayedNicks[1])}, {renderUserLink(displayedNicks[2])} e altri {othersCount} hanno brindato
          </>
        )}
      </span>
    </div>
  );
};
