import React from 'react';

type TrafficLightType = 'close' | 'minimize' | 'maximize';

interface TrafficLightButtonProps {
  type: TrafficLightType;
  onClick: () => void;
  isMaximized?: boolean;
}

const config = {
  close: {
    color: '#FF5F57',
    shadow: '#E0443E',
    iconColor: '#4D0000',
  },
  minimize: {
    color: '#FFBD2E',
    shadow: '#DEA123',
    iconColor: '#995700',
  },
  maximize: {
    color: '#28C840',
    shadow: '#1AAB29',
    iconColor: '#006500',
  },
} as const;

const CloseIcon = ({ color }: { color: string }) => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path
      d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const MinimizeIcon = ({ color }: { color: string }) => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path
      d="M1 4H7"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const MaximizeIcon = ({ color }: { color: string }) => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path
      d="M1 2.5V1.5C1 1.224 1.224 1 1.5 1H2.5M7 5.5V6.5C7 6.776 6.776 7 6.5 7H5.5M5.5 1H6.5C6.776 1 7 1.224 7 1.5V2.5M2.5 7H1.5C1.224 7 1 6.776 1 6.5V5.5"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </svg>
);

const RestoreIcon = ({ color }: { color: string }) => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path
      d="M1.5 3L4 1L6.5 3M1.5 5L4 7L6.5 5"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TrafficLightButton: React.FC<TrafficLightButtonProps> = ({
  type,
  onClick,
  isMaximized = false,
}) => {
  const { color, shadow, iconColor } = config[type];

  const renderIcon = () => {
    switch (type) {
      case 'close':
        return <CloseIcon color={iconColor} />;
      case 'minimize':
        return <MinimizeIcon color={iconColor} />;
      case 'maximize':
        return isMaximized ? <RestoreIcon color={iconColor} /> : <MaximizeIcon color={iconColor} />;
    }
  };

  return (
    <button
      onClick={onClick}
      className="group relative w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-100 focus:outline-none"
      style={{
        backgroundColor: color,
        boxShadow: `inset 0 0 0 0.5px ${shadow}, 0 1px 0 0 rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.4)`,
      }}
      aria-label={type}
    >
      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-100">
        {renderIcon()}
      </span>
    </button>
  );
};

export default TrafficLightButton;