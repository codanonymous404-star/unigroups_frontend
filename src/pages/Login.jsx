import { useState } from 'react'
import { motion } from 'framer-motion'
import Icon    from '../components/ui/Icons.jsx'
import { useAuth }  from '../context/AuthContext.jsx'
import { authAPI }  from '../api/auth.js'
import Button  from '../components/ui/Button.jsx'
import Input   from '../components/ui/Input.jsx'
import Alert   from '../components/ui/Alert.jsx'
import { extractError } from '../hooks/useApi.js'
import { staggerContainer, fadeUp, scaleIn, spring, springSnappy, springSmooth, springBouncy, springInstant } from '../utils/animations.js'
import { useApp } from '../context/AppContext.jsx'

export default function Login({ onSwitch }) {
  const { login } = useAuth()
  const { dark, toggleDark } = useApp()
  const [roll, setRoll] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoad]       = useState(false)
  const [error, setError]        = useState('')
  const [unverified, setUnver]   = useState(false)
  const [resending, setResend]   = useState(false)
  const [ok, setOk]              = useState('')

  const submit = async e => {
    e.preventDefault(); setError(''); setUnver(false); setOk('')
    if (!roll||!pass) { setError('All fields required.'); return }
    setLoad(true)
    try { await login(roll.toUpperCase().trim(), pass) }
    catch (err) {
      if (err.response?.data?.unverified) { setUnver(true); setError('Email not verified. Check your inbox.') }
      else setError(extractError(err))
    } finally { setLoad(false) }
  }
  const resend = async () => {
    setResend(true); setError(''); setOk('')
    try { await authAPI.resendOtp(roll.toUpperCase().trim()); setOk('Code sent! Check your email.') }
    catch (err) { setError(extractError(err)) } finally { setResend(false) }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex transition-colors duration-300">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12" style={{background:"var(--bg-surface)",borderRight:"1px solid var(--border)",backdropFilter:"blur(24px)", transition:"background 0.3s, border 0.3s"}}>
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <Icon name="graduationCap" size={18} className="text-white"/>
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)]">UniGroups</span>
          </div>
          <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{...springSmooth,delay:0.2}} className="text-6xl font-bold text-[var(--text-primary)] leading-tight mb-4">Welcome<br/>back.</motion.h1>
          <p className="text-[var(--text-secondary)] text-sm">Superior University<br/>Group Management System</p>
        </div>
        <div className="space-y-3">
          {[{dot:'bg-orange-400',l:'Software Engineering'},{dot:'bg-cyan-400',l:'Computer Science'}].map(d=>(
            <div key={d.l} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${d.dot}`}/>
              <span className="text-xs text-[var(--text-muted)]">{d.l}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-base)] transition-colors duration-300">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <Icon name="graduationCap" size={16} className="text-white"/>
            </div>
            <span className="font-bold text-[var(--text-primary)]">UniGroups</span>
          </div>

          <div className="card">
            <div className="card2">
              <form className="form-uiverse" onSubmit={submit}>
                <p id="heading">Login</p>
                
                {ok && <div className="mb-2"><Alert type="success" message={ok}/></div>}
                {error && <div className="mb-2"><Alert type="error" message={error} onClose={()=>{setError('');setUnver(false)}}/></div>}
                
                {unverified && (
                  <div className="mb-2 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-400/8 border border-amber-200 dark:border-amber-400/20">
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Email not verified</span>
                    <Button type="button" variant="ghost" size="sm" loading={resending} onClick={resend} className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-400/10 text-[11px]">Resend code</Button>
                  </div>
                )}

                <div className="field">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                  </svg>
                  <input 
                    autoComplete="off" 
                    placeholder=" " 
                    className="input-field font-mono" 
                    type="text" 
                    value={roll}
                    onChange={e => setRoll(e.target.value.toUpperCase())}
                    required
                  />
                  <span className="floating-label">Roll Number</span>
                </div>
                
                <div className="field">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  </svg>
                  <input 
                    placeholder=" " 
                    className="input-field" 
                    type="password" 
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    required
                  />
                  <span className="floating-label">Password</span>
                </div>

                <div className="btn-row">
                  <button type="submit" disabled={loading} className="button1">
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                  <button type="button" onClick={onSwitch} className="button2">Sign Up</button>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => alert('Password reset services are handled directly by the University IT Helpdesk.')} 
                  className="button3"
                >
                  Forgot Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .card {
          position: relative;
          border-radius: 26px;
          padding: 1px;
          background-color: transparent;
          transition: all 0.3s ease-in-out;
        }

        .card:before, .card:after {
          content: '';
          position: absolute;
          left: -1px;
          top: -1px;
          border-radius: 27px;
          background: linear-gradient(45deg, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000, #fb0094, 
            #0000ff, #00ff00, #ffff00, #ff0000);
          background-size: 400%;
          width: calc(100% + 2px);
          height: calc(100% + 2px);
          z-index: 0;
          animation: steam 20s linear infinite;
        }

        @keyframes steam {
          0% {
            background-position: 0 0;
          }
          50% {
            background-position: 400% 0;
          }
          100% {
            background-position: 0 0;
          }
        }

        .card:after {
          filter: blur(50px);
          opacity: 0.85;
          z-index: -1;
        }

        .card2 {
          position: relative;
          z-index: 10;
          border-radius: 25px;
          background: linear-gradient(0deg, #0b0c10, #20212b);
          transition: all 0.3s ease-in-out;
          overflow: hidden;
        }

        .card2:hover {
          transform: scale(0.99);
        }

        .form-uiverse {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 2.5em 2em 1.5em;
          background: transparent;
          border-radius: 25px;
          width: 100%;
        }

        /* Enforce light/white styling on dark gradient card */
        .card #heading {
          color: #ffffff;
        }
        .card .field {
          background-color: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .card .field:focus-within {
          border-color: #6366f1;
          background-color: rgba(255, 255, 255, 0.08);
        }
        .card .input-field {
          color: #ffffff;
        }
        .card .floating-label {
          color: rgba(255, 255, 255, 0.5);
        }
        .card .input-field:focus ~ .floating-label,
        .card .input-field:not(:placeholder-shown) ~ .floating-label {
          color: #818cf8;
        }
        .card .button2 {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }
        .card .button2:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        .card .button3 {
          color: rgba(255, 255, 255, 0.4);
        }
        .card .button3:hover {
          color: #fca5a5;
        }

        #heading {
          text-align: center;
          margin-bottom: 1.2em;
          color: var(--text-primary);
          font-size: 1.5em;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.5px;
        }

        .field {
          position: relative;
          display: flex;
          align-items: center;
          border-radius: 20px;
          height: 48px;
          padding: 0 16px;
          border: 1px solid var(--border);
          outline: none;
          color: var(--text-primary);
          background-color: var(--bg-raised);
          transition: border-color 0.25s, background-color 0.25s;
        }

        .field:focus-within {
          border-color: #6366f1;
          background-color: var(--bg-surface);
        }

        .input-icon {
          height: 1.2em;
          width: 1.2em;
          fill: var(--text-muted);
          color: var(--text-muted);
          margin-right: 10px;
          flex-shrink: 0;
          margin-top: 8px;
        }

        .input-field {
          background: none;
          border: none;
          outline: none;
          width: 100%;
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          height: 100%;
          padding-top: 14px;
          padding-bottom: 2px;
        }

        .floating-label {
          position: absolute;
          left: 44px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          pointer-events: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-field:focus ~ .floating-label,
        .input-field:not(:placeholder-shown) ~ .floating-label {
          top: 10px;
          font-size: 9.5px;
          color: #6366f1;
          font-weight: 600;
        }

        .form-uiverse .btn-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 1.5em;
        }

        .button1 {
          flex: 1.2;
          padding: 0.8em;
          border-radius: 12px;
          border: none;
          outline: none;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          transition: .3s ease-in-out;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(99,102,241,0.25);
        }

        .button1:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }

        .button2 {
          flex: 1;
          padding: 0.8em;
          border-radius: 12px;
          border: 1px solid var(--border);
          outline: none;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          transition: .3s ease-in-out;
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
        }

        .button2:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .button3 {
          margin-top: 0.5em;
          padding: 0.5em;
          border-radius: 8px;
          border: none;
          outline: none;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          transition: .3s ease-in-out;
          background-color: transparent;
          color: var(--text-muted);
          cursor: pointer;
          text-align: center;
          width: 100%;
        }

        .button3:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  )
}
