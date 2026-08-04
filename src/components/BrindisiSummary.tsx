import React from 'react';

interface BrindisiSummaryProps {
  likes?: Record<string, boolean>;
  currentUserNick: string;
  globalDisplayNames?: Record<string, string>;
  onOpenPublicProfile: (username: string) => void;
}

export const BrindisiSummary: React.FC<BrindisiSummaryProps> = ({
  likes,
  currentUserNick,
  globalDisplayNames,
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
        padding: '2px 16px 8px 16px',
        fontSize: '13px',
        color: 'var(--text-dark, #334155)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexWrap: 'wrap',
        lineHeight: '1.4'
      }}
    >
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
