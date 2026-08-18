const particles = [
  { left: '4%', top: '18%', size: 3, delay: '-2s', duration: '18s', drift: '42px' },
  { left: '11%', top: '72%', size: 2, delay: '-8s', duration: '23s', drift: '-30px' },
  { left: '18%', top: '34%', size: 4, delay: '-12s', duration: '20s', drift: '36px' },
  { left: '27%', top: '86%', size: 2, delay: '-5s', duration: '25s', drift: '-44px' },
  { left: '33%', top: '12%', size: 3, delay: '-16s', duration: '21s', drift: '28px' },
  { left: '41%', top: '58%', size: 2, delay: '-10s', duration: '19s', drift: '-34px' },
  { left: '48%', top: '25%', size: 4, delay: '-4s', duration: '24s', drift: '48px' },
  { left: '56%', top: '78%', size: 2, delay: '-14s', duration: '22s', drift: '-26px' },
  { left: '63%', top: '8%', size: 3, delay: '-7s', duration: '18s', drift: '32px' },
  { left: '69%', top: '46%', size: 2, delay: '-18s', duration: '26s', drift: '-38px' },
  { left: '76%', top: '20%', size: 4, delay: '-11s', duration: '21s', drift: '40px' },
  { left: '83%', top: '68%', size: 2, delay: '-3s', duration: '23s', drift: '-32px' },
  { left: '91%', top: '36%', size: 3, delay: '-15s', duration: '20s', drift: '30px' },
  { left: '96%', top: '88%', size: 2, delay: '-9s', duration: '24s', drift: '-46px' },
]

export function FloatingParticles() {
  return (
    <div className="floating-particles" aria-hidden="true">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="floating-particle"
          style={{
            '--particle-left': particle.left,
            '--particle-top': particle.top,
            '--particle-size': `${particle.size}px`,
            '--particle-delay': particle.delay,
            '--particle-duration': particle.duration,
            '--particle-drift': particle.drift,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
