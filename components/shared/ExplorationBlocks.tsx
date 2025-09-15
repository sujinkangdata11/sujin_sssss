import React from 'react';

export interface ExplorationBlock {
  id: string;
  title: string;
  description?: string;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  content?: React.ReactNode;
  customStyle?: React.CSSProperties;
}

interface ExplorationBlocksProps {
  blocks: ExplorationBlock[];
  className?: string;
  style?: React.CSSProperties;
}

const ExplorationBlocks: React.FC<ExplorationBlocksProps> = ({
  blocks,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`exploration-blocks ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0px',
        width: '100%',
        ...style
      }}
    >
      {blocks.map((block, index) => (
        <div
          key={block.id}
          onClick={block.disabled ? undefined : block.onClick}
          style={{
            textAlign: 'left',
            fontSize: '24px',
            fontWeight: 'bold',
            color: block.disabled ? '#9ca3af' : '#333',
            padding: '40px 0 clamp(1rem, 4vw, 2rem) 0',
            backgroundColor: block.isActive ? '#f3f4f6' : '#ffffff',
            border: 'none',
            borderRadius: '16px',
            boxShadow: 'none',
            transition: 'all 0.2s ease',
            width: '100%',
            minHeight: 'fit-content',
            cursor: block.disabled ? 'not-allowed' : (block.onClick ? 'pointer' : 'default'),
            opacity: block.disabled ? 0.6 : 1,
            ...block.customStyle
          }}
        >
          <div style={{ padding: '0' }}>
            {block.title}
            {block.description && (
              <div style={{
                fontSize: '16px',
                fontWeight: 'normal',
                color: block.disabled ? '#9ca3af' : '#6b7280',
                marginTop: '8px',
                lineHeight: '1.5'
              }}>
                {block.description}
              </div>
            )}
            {block.content && (
              <div style={{ marginTop: '16px' }}>
                {block.content}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExplorationBlocks;