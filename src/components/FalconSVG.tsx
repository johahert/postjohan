interface FalconSVGProps {
  size?: number
  color?: string
  flap?: boolean
}

export function FalconSVG({ size = 200, color = '#e8b840', flap = false }: FalconSVGProps) {
  const h = size * 0.78
  return (
    <svg width={size} height={h} viewBox="0 0 200 156" fill={color}>
      {/* Head */}
      <ellipse cx="100" cy="24" rx="12" ry="15" />
      {/* Beak */}
      <path d="M95,11 Q100,3 105,11 Q102,13 100,13 Q98,13 95,11 Z" />
      {/* Body */}
      <path d="M88,36 L90,34 L100,32 L110,34 L112,36 L115,108 L113,118 L100,122 L87,118 L85,108 Z" />
      {/* Tail fork */}
      <path d="M88,114 Q82,128 78,142 Q86,136 100,130 Q114,136 122,142 Q118,128 112,114 Z" />
      {/* Left wing */}
      <path
        d="M90,58 Q72,46 46,34 Q22,22 6,26 Q1,34 8,42 Q26,45 54,51 Q74,56 90,66 Z"
        style={{ animation: flap ? 'wingPumpL 0.55s ease-in-out infinite' : 'none' }}
      />
      <path d="M90,66 Q68,70 44,72 Q24,73 10,70 Q6,76 12,80 Q30,80 54,76 Q74,73 90,72 Z" opacity="0.7" />
      {/* Right wing */}
      <path
        d="M110,58 Q128,46 154,34 Q178,22 194,26 Q199,34 192,42 Q174,45 146,51 Q126,56 110,66 Z"
        style={{ animation: flap ? 'wingPumpR 0.55s ease-in-out infinite' : 'none' }}
      />
      <path d="M110,66 Q132,70 156,72 Q176,73 190,70 Q194,76 188,80 Q170,80 146,76 Q126,73 110,72 Z" opacity="0.7" />
    </svg>
  )
}

interface FalconMarkProps {
  size?: number
  color?: string
}

export function FalconMark({ size = 20, color = '#e8b840' }: FalconMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <path d="M10,6 Q6,8 2,7 L3,11 Q6,10 10,10 Q14,10 17,11 L18,7 Q14,8 10,6 Z" />
      <rect x="9" y="8" width="2" height="8" rx="1" />
      <circle cx="10" cy="4" r="2.8" />
      <path d="M8.8,2 Q10,0 11.2,2 Q10.6,2.6 10,2.6 Q9.4,2.6 8.8,2 Z" />
    </svg>
  )
}
