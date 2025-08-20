import React from 'react';

const LuckyIcon: React.FC<{ size?: number }> = ({ size = 40 }) => {
  const scale = size / 200; // 원본 크기 200px 기준으로 스케일 조정
  
  return (
    <div 
      style={{
        width: size,
        height: size,
        position: 'relative',
        cursor: 'pointer',
        border: `${4 * scale}px solid #000`,
        background: '#FFD700',
      }}
      className="lucky-icon"
    >
      {/* 그림자 */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          background: '#000',
          top: `${8 * scale}px`,
          left: `${8 * scale}px`,
          zIndex: -1,
        }}
      />
      
      {/* 물음표 픽셀 패턴 */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${120 * scale}px`,
          height: `${120 * scale}px`,
        }}
      >
        {/* 검은색 그림자 픽셀들 (ps) */}
        {[
          [2,14],[2,26],[2,38],[2,50],[2,62],[2,74],[2,86],
          [14,2],[14,62],[14,74],[14,86],[14,98],
          [26,2],[26,62],[26,74],[26,86],[26,98],
          [38,50],[38,62],[38,74],[38,86],[38,98],
          [50,38],[50,50],[50,62],[50,74],
          [62,26],[62,38],[62,50],[62,62],
          [74,38],[74,50],[74,62],
          [98,38],[98,50],[98,62],
          [110,38],[110,50],[110,62]
        ].map(([top, left], i) => (
          <div key={`ps-${i}`} style={{
            position: 'absolute', 
            width: `${12 * scale}px`, 
            height: `${12 * scale}px`, 
            background: '#000', 
            top: `${top * scale}px`, 
            left: `${left * scale}px`
          }} />
        ))}
        
        {/* 주황색 픽셀들 (p) */}
        {[
          [0,12],[0,24],[0,36],[0,48],[0,60],[0,72],
          [12,0],[12,60],[12,72],[12,84],
          [24,0],[24,60],[24,72],[24,84],
          [36,48],[36,60],[36,72],[36,84],
          [48,36],[48,48],[48,60],
          [60,24],[60,36],[60,48],
          [72,36],[72,48],
          [96,36],[96,48],
          [108,36],[108,48]
        ].map(([top, left], i) => (
          <div key={`p-${i}`} style={{
            position: 'absolute', 
            width: `${12 * scale}px`, 
            height: `${12 * scale}px`, 
            background: '#D2691E', 
            top: `${top * scale}px`, 
            left: `${left * scale}px`
          }} />
        ))}
      </div>
      
      {/* 모서리 점들 (d) */}
      <div style={{position: 'absolute', width: `${12 * scale}px`, height: `${12 * scale}px`, background: '#000', top: `${20 * scale}px`, left: `${20 * scale}px`}} />
      <div style={{position: 'absolute', width: `${12 * scale}px`, height: `${12 * scale}px`, background: '#000', top: `${20 * scale}px`, right: `${20 * scale}px`}} />
      <div style={{position: 'absolute', width: `${12 * scale}px`, height: `${12 * scale}px`, background: '#000', bottom: `${20 * scale}px`, left: `${20 * scale}px`}} />
      <div style={{position: 'absolute', width: `${12 * scale}px`, height: `${12 * scale}px`, background: '#000', bottom: `${20 * scale}px`, right: `${20 * scale}px`}} />
    </div>
  );
};

export default LuckyIcon;