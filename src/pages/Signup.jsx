import { useState } from 'react'
import Icon from '../components/ui/Icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { authAPI } from '../api/auth.js'
import Button      from '../components/ui/Button.jsx'
import Input       from '../components/ui/Input.jsx'
import Alert       from '../components/ui/Alert.jsx'
import DeptSelector from '../components/forms/DeptSelector.jsx'
import { extractError } from '../hooks/useApi.js'

function Step1({ onDone }) {
  const { register } = useAuth()
  const [f, setF] = useState({ roll_number:'', name:'', email:'', department:'', password:'', password2:'' })
  const [loading, setLoad] = useState(false); const [error, setError] = useState('')
  const set = k => e => setF(p=>({...p,[k]:e.target.value}))
  const submit = async e => {
    e.preventDefault(); setError('')
    if (!['roll_number','name','email','department','password','password2'].every(k=>f[k])) { setError('All fields required.'); return }
    if (f.password !== f.password2) { setError('Passwords do not match.'); return }
    if (f.password.length < 8) { setError('Password min 8 characters.'); return }
    setLoad(true)
    try { const d = await register(f); onDone({ roll_number:d.roll_number, email:f.email, dev_otp:d.dev_otp }) }
    catch (err) { setError(extractError(err)) } finally { setLoad(false) }
  }
  return <>
    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1" id="heading">Create account</h2>
    <Alert type="error" message={error} onClose={()=>setError('')}/>
    <form onSubmit={submit} className="space-y-4 mt-5">
      <div className="field">
        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
        <input 
          autoComplete="off" 
          placeholder=" " 
          className="input-field font-mono" 
          type="text" 
          value={f.roll_number} 
          onChange={e=>setF(p=>({...p,roll_number:e.target.value.toUpperCase()}))} 
          required
        />
        <span className="floating-label">Roll Number</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input 
            placeholder=" " 
            className="input-field" 
            type="text" 
            value={f.name} 
            onChange={set('name')} 
            required
          />
          <span className="floating-label">Full Name</span>
        </div>
        <div className="field">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <input 
            placeholder=" " 
            className="input-field" 
            type="email" 
            value={f.email} 
            onChange={set('email')} 
            required
          />
          <span className="floating-label">Email</span>
        </div>
      </div>
      <DeptSelector value={f.department} onChange={v=>setF(p=>({...p,department:v}))}/>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input 
            placeholder=" " 
            className="input-field" 
            type="password" 
            value={f.password} 
            onChange={set('password')} 
            required
          />
          <span className="floating-label">Password</span>
        </div>
        <div className="field">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input 
            placeholder=" " 
            className="input-field" 
            type="password" 
            value={f.password2} 
            onChange={set('password2')} 
            required
          />
          <span className="floating-label">Confirm</span>
        </div>
      </div>
      <Button type="submit" size="lg" loading={loading} fullWidth>Create Account →</Button>
    </form>
  </>
}

function Step2({ rollNumber, email, devOtp }) {
  const { verifyEmail } = useAuth()
  const [otp, setOtp]             = useState(devOtp||'')
  const [loading, setLoad]        = useState(false)
  const [error, setError]         = useState('')
  const [resending, setResend]    = useState(false)
  const [ok, setOk]               = useState('')

  const submit = async e => {
    e.preventDefault(); setError('')
    if (otp.length!==6) { setError('Enter 6-digit code.'); return }
    setLoad(true)
    try { await verifyEmail(rollNumber, otp) } catch (err) { setError(extractError(err)) } finally { setLoad(false) }
  }
  const resend = async () => {
    setResend(true)
    try { await authAPI.resendOtp(rollNumber); setOk('New code sent!') } catch (err) { setError(extractError(err)) } finally { setResend(false) }
  }
  return <>
    <div className="text-center mb-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
        <Icon name="mail" size={28} className="text-indigo-600 dark:text-indigo-400"/>
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Check your email</h2>
      <p className="text-sm text-[var(--text-secondary)] mt-1">Code sent to <span className="text-[var(--text-primary)] font-medium">{email}</span></p>
    </div>
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] mb-5">
      <Icon name="creditCard" size={14} className="text-indigo-500 shrink-0"/>
      <div>
        <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Roll Number</p>
        <p className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">{rollNumber}</p>
      </div>
    </div>
    {ok && <div className="mb-3"><Alert type="success" message={ok}/></div>}
    <Alert type="error" message={error} onClose={()=>setError('')}/>
    <form onSubmit={submit} className="space-y-4 mt-5">
      <div>
        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 text-center">6-Digit Code</label>
        <input type="text" inputMode="numeric" maxLength={6} placeholder="0  0  0  0  0  0"
          value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
          className="w-full py-4 px-4 text-center text-2xl font-mono font-bold tracking-[0.5em] bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"/>
        <p className="text-xs text-[var(--text-faint)] text-center mt-1.5">Expires in 10 minutes</p>
      </div>
      <Button type="submit" size="lg" loading={loading} disabled={otp.length!==6} fullWidth>
        <Icon name="checkCircle" size={16}/> Verify & Login
      </Button>
    </form>
    <p className="text-center text-sm text-[var(--text-secondary)] mt-5">Didn't receive it?{' '}
      <button onClick={resend} disabled={resending} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50">
        {resending?'Sending…':'Resend code'}
      </button>
    </p>
    {devOtp && (
      <div className="mt-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-400/8 border border-amber-200 dark:border-amber-400/20 text-center">
        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mb-1">Dev Mode — OTP:</p>
        <p className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-300 tracking-[0.4em]">{devOtp}</p>
      </div>
    )}
  </>
}

export default function Signup({ onSwitch }) {
  const [step, setStep]     = useState(1)
  const [otpData, setOtpData] = useState(null)
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex transition-colors duration-300">
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12" style={{background:"var(--bg-surface)",borderRight:"1px solid var(--border)",backdropFilter:"blur(24px)", transition:"background 0.3s, border 0.3s"}}>
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <Icon name="graduationCap" size={18} className="text-white"/>
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)]">UniGroups</span>
          </div>
          <h1 className="text-5xl font-bold text-[var(--text-primary)] leading-tight mb-6">Join your<br/>university<br/>groups.</h1>
          <div className="space-y-4 mt-8">
            {['Register','Verify Email'].map((label,i)=>{
              const done=step>i+1; const cur=step===i+1
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done?'bg-green-500 text-white':cur?'bg-indigo-600 dark:bg-indigo-500 text-white':'bg-[var(--bg-raised)] text-[var(--text-muted)]'}`}>
                    {done?<Icon name="check" size={10} strokeWidth={3}/>:i+1}
                  </div>
                  <span className={`text-sm font-medium ${cur?'text-[var(--text-primary)]':done?'text-green-600 dark:text-green-400':'text-[var(--text-muted)]'}`}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
        <p className="text-xs text-[var(--text-faint)]">Superior University · GMS</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto bg-[var(--bg-base)] transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <Icon name="graduationCap" size={16} className="text-white"/>
            </div>
            <span className="font-bold text-[var(--text-primary)]">UniGroups</span>
          </div>

          <div className="card">
            <div className="card2">
              <div className="form-uiverse">
                {step===1 ? <Step1 onDone={d=>{setOtpData(d);setStep(2)}}/> : <Step2 rollNumber={otpData.roll_number} email={otpData.email} devOtp={otpData.dev_otp}/>}
              </div>
            </div>
          </div>

          {step===1 && <>
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-[var(--border)]"/>
              <span className="text-xs text-[var(--text-faint)]">or</span>
              <div className="h-px flex-1 bg-[var(--border)]"/>
            </div>
            <p className="text-center text-sm text-[var(--text-secondary)]">Have an account?{' '}
              <button onClick={onSwitch} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Sign in</button>
            </p>
          </>}
        </div>
      </div>

      <style>{`
        .card {
          position: relative;
          border-radius: 26px;
          padding: 1px;
          background-color: transparent;
          transition: all 0.3s ease-in-out;
          width: 100%;
        }

        .card:before, .card:after {
          content: '';
          position: absolute;
          left: -2px;
          top: -2px;
          border-radius: 27px;
          background: linear-gradient(45deg, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000, #fb0094, 
            #0000ff, #00ff00, #ffff00, #ff0000);
          background-size: 400%;
          width: calc(100% + 4px);
          height: calc(100% + 4px);
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
          background-color: var(--bg-surface);
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
          padding: 2.2em 2em 1.5em;
          background-color: var(--bg-surface);
          border-radius: 25px;
          width: 100%;
        }

        #heading {
          text-align: center;
          margin-bottom: 1em;
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
          fill: none;
          stroke: var(--text-muted);
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

        .btn-row {
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

        .button1:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
