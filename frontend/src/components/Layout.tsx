import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, FlaskConical, GraduationCap, Code2, Settings } from 'lucide-react'
import styles from './Layout.module.css'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  
  const navItems = [
    { path: '/cambric-labs/', icon: Home, label: 'Home' },
    { path: '/cambric-labs/lab', icon: FlaskConical, label: 'Labs' },
    { path: '/cambric-labs/learn', icon: GraduationCap, label: 'Learn' },
    { path: '/cambric-labs/admin', icon: Code2, label: 'Developer' },
  ]
  
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="6" stroke="var(--lab-accent-blue)" strokeWidth="2" fill="none"/>
            <circle cx="16" cy="16" r="2" fill="var(--lab-accent-blue)"/>
            <line x1="16" y1="4" x2="16" y2="10" stroke="var(--lab-accent-cyan)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="22" x2="16" y2="28" stroke="var(--lab-accent-cyan)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="4" y1="16" x2="10" y2="16" stroke="var(--lab-accent-green)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="22" y1="16" x2="28" y2="16" stroke="var(--lab-accent-green)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className={styles.logoText}>CAMBRIC LABS</span>
        </div>
        
        <nav className={styles.nav}>
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`${styles.navItem} ${location.pathname.startsWith(path) ? styles.active : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        
        <div className={styles.headerRight}>
          <button className={styles.settingsBtn}>
            <Settings size={20} />
          </button>
        </div>
      </header>
      
      <main className={styles.main}>
        {children}
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.status}>
          <span className={styles.statusDot} />
          <span>Ready</span>
        </div>
        <div className={styles.footerInfo}>
          CAMBRIC LABS v1.0 — Neural Network Laboratory
        </div>
      </footer>
    </div>
  )
}
