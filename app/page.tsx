'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown, ExternalLink, Gamepad2, LogOut, Menu, RefreshCw, Search, Smartphone, Sparkles, Ticket, X } from 'lucide-react';

type Rate = { name: string; category: string; price: string; value?: string; update?: string };
const fallback: Rate[] = [
  { name: 'Free Fire', category: 'เกม', price: '฿ 36.00', value: '100 Diamonds', update: 'วันนี้' },
  { name: 'ROV', category: 'เกม', price: '฿ 50.00', value: '110 Vouchers', update: 'วันนี้' },
  { name: 'PUBG Mobile', category: 'เกม', price: '฿ 35.00', value: '60 UC', update: 'วันนี้' },
  { name: 'Garena Shells', category: 'บัตรเงินสด', price: '฿ 100.00', value: '100 Shells', update: 'วันนี้' },
  { name: 'TrueMoney Wallet', category: 'เติมเงินมือถือ', price: '฿ 100.00', value: '100 บาท', update: 'วันนี้' },
  { name: 'ShopeePay', category: 'เติมเงินมือถือ', price: '฿ 50.00', value: '50 บาท', update: 'วันนี้' },
];
const categories = ['ทั้งหมด', 'เกม', 'เติมเงินมือถือ', 'บัตรเงินสด'];

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [provider, setProvider] = useState('Wepay');
  const [category, setCategory] = useState('ทั้งหมด');
  const [query, setQuery] = useState('');
  const [rates, setRates] = useState<Rate[]>(fallback);
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => { setAuthenticated(sessionStorage.getItem('ratehub-auth') === '1'); setCheckingSession(false); }, []);
  function login(event: React.FormEvent) { event.preventDefault(); if (username.trim() === 'genzgame' && password === 'genzgametopup1234') { sessionStorage.setItem('ratehub-auth', '1'); setAuthenticated(true); setLoginError(''); } else setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'); }
  function logout() { sessionStorage.removeItem('ratehub-auth'); setAuthenticated(false); }

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch('/api/rates', { cache: 'no-store' });
      const data = await response.json();
      if (Array.isArray(data.rates) && data.rates.length) setRates(data.rates);
    } catch { /* keep curated fallback */ }
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);
  const filtered = useMemo(() => rates.filter((r) => (category === 'ทั้งหมด' || r.category === category) && r.name.toLowerCase().includes(query.toLowerCase())), [rates, category, query]);

  if (checkingSession) return <main className="auth-loading"><span className="brand-mark">R</span></main>;
  if (!authenticated) return <main className="auth-page"><div className="auth-glow"/><div className="auth-box"><a className="brand auth-brand" href="#"><span className="brand-mark">R</span><span>Rate<span className="accent">Hub</span></span></a><div className="auth-eyebrow">MEMBER ACCESS</div><h1>เข้าสู่ระบบ</h1><p>กรุณาเข้าสู่ระบบเพื่อดูเรทราคาและข้อมูลผู้ให้บริการ</p><form onSubmit={login}><label>ชื่อผู้ใช้<input autoFocus value={username} onChange={e => setUsername(e.target.value)} placeholder="กรอกชื่อผู้ใช้" /></label><label>รหัสผ่าน<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="กรอกรหัสผ่าน" /></label>{loginError && <div className="login-error">{loginError}</div>}<button className="login-btn" type="submit">เข้าสู่ระบบ <ArrowUpRight size={17}/></button></form><small className="auth-note">ระบบนี้สำหรับผู้ใช้งานที่ได้รับอนุญาตเท่านั้น</small></div></main>;
  return <main>
    <nav className="nav"><div className="nav-inner"><a className="brand" href="#top"><span className="brand-mark">R</span><span>Rate<span className="accent">Hub</span></span></a><div className="nav-links"><a href="#rates">เรทราคา</a><a href="#providers">ผู้ให้บริการ</a><a href="#about">เกี่ยวกับเรา</a></div><div className="nav-actions"><a className="credit-link" href="https://www.facebook.com/sprite.m79" target="_blank">ติดต่อผู้จัดทำ <ArrowUpRight size={16}/></a><button className="logout-btn" onClick={logout}><LogOut size={15}/> ออกจากระบบ</button></div><button className="menu-btn" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button></div>{menu && <div className="mobile-menu"><a href="#rates">เรทราคา</a><a href="#providers">ผู้ให้บริการ</a><a href="#about">เกี่ยวกับเรา</a></div>}</nav>
    <section className="hero" id="top"><div className="hero-glow"/><div className="hero-content"><div className="eyebrow"><Sparkles size={15}/> LIVE RATE DIRECTORY</div><h1>เช็คราคาเกม<br/><span>เติมเงินได้ทันที</span></h1><p>รวมเรทเติมเกม เติมเงินมือถือ และบัตรเงินสด<br className="desktop"/>จากผู้ให้บริการชั้นนำ ในที่เดียว</p><div className="hero-actions"><a href="#rates" className="primary-btn">ดูเรทราคาทั้งหมด <ArrowUpRight size={18}/></a><a href="#providers" className="secondary-btn">เลือก Provider</a></div></div><div className="hero-card"><div className="card-top"><span className="live-dot"/> อัปเดตแบบเรียลไทม์ <span className="provider-pill">{provider}</span></div><div className="mini-rate"><div className="mini-icon game"><Gamepad2 size={21}/></div><div><b>Free Fire</b><small>100 Diamonds</small></div><strong>฿ 36.00</strong></div><div className="mini-rate"><div className="mini-icon phone"><Smartphone size={21}/></div><div><b>TrueMoney Wallet</b><small>100 บาท</small></div><strong>฿ 100.00</strong></div><div className="mini-rate"><div className="mini-icon ticket"><Ticket size={21}/></div><div><b>Garena Shells</b><small>100 Shells</small></div><strong>฿ 100.00</strong></div><div className="card-foot">ข้อมูลจาก Wepay API <span>● เชื่อมต่อแล้ว</span></div></div></section>
    <section className="stats"><div><b>01</b><span>ผู้ให้บริการ</span></div><div><b>{rates.length || '—'}</b><span>รายการเรท</span></div><div><b>24/7</b><span>อัปเดตข้อมูล</span></div><div><b>ฟรี</b><span>ใช้งานได้ทันที</span></div></section>
    <section className="rates-section" id="rates"><div className="section-heading"><div><div className="eyebrow dark"><span/> RATE DIRECTORY</div><h2>เรทราคาทั้งหมด</h2><p>เลือก Provider และหมวดหมู่ที่ต้องการ เพื่อดูราคาล่าสุด</p></div><button className="refresh" onClick={refresh} disabled={loading}><RefreshCw size={17} className={loading ? 'spin' : ''}/> {loading ? 'กำลังอัปเดต' : 'รีเฟรชข้อมูล'}</button></div><div className="toolbar"><div className="provider-select"><label>PROVIDER</label><div className="select-wrap"><select value={provider} onChange={e => setProvider(e.target.value)}><option>Wepay</option><option disabled>Provider อื่นๆ (เร็วๆ นี้)</option></select><ChevronDown size={17}/></div></div><div className="category-tabs">{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div><div className="search"><Search size={17}/><input placeholder="ค้นหาสินค้า..." value={query} onChange={e => setQuery(e.target.value)}/></div></div><div className="table-wrap"><table><thead><tr><th>สินค้า / บริการ</th><th>หมวดหมู่</th><th>จำนวนที่ได้รับ</th><th>ราคา</th><th>อัปเดต</th></tr></thead><tbody>{filtered.map((r, i) => <tr key={i}><td><span className="product-icon"><Gamepad2 size={17}/></span><b>{r.name}</b></td><td><span className="tag">{r.category}</span></td><td className="muted">{r.value || '—'}</td><td className="price">{r.price}</td><td className="muted">{r.update || 'ล่าสุด'}</td></tr>)}</tbody></table>{!filtered.length && <div className="empty">ไม่พบรายการที่ค้นหา</div>}</div><p className="source-note">ข้อมูลเรทอ้างอิงจาก <a href="https://www.wepay.in.th/comp_export.php" target="_blank">Wepay API <ExternalLink size={13}/></a> · ราคาอาจเปลี่ยนแปลงตามผู้ให้บริการ</p></section>
    <section className="providers" id="providers"><div className="eyebrow dark"><span/> OUR PROVIDERS</div><h2>ผู้ให้บริการที่รองรับ</h2><div className="provider-card"><div className="wepay-logo">W</div><div><b>Wepay</b><span>เติมเกมและบัตรเงินสด</span></div><span className="connected">เชื่อมต่อแล้ว</span><button onClick={() => document.getElementById('rates')?.scrollIntoView({behavior:'smooth'})}>ดูเรท <ArrowUpRight size={16}/></button></div></section>
    <footer id="about"><div className="footer-brand"><span className="brand-mark">R</span><b>Rate<span className="accent">Hub</span></b><p>ศูนย์รวมเรทเกมและบัตรเงินสด<br/>ที่ใช้งานง่ายสำหรับทุกคน</p></div><div><small>จัดทำโดย</small><a href="https://www.facebook.com/sprite.m79" target="_blank" className="author"><img className="avatar" src="/profile.jpg" alt="รูปโปรไฟล์ผู้จัดทำ"/><span><b>Sprite M79</b><em>Facebook Profile <ArrowUpRight size={13}/></em></span></a></div><div className="footer-right"><small>สนใจทำเว็บไซต์แบบนี้?</small><a href="https://www.facebook.com/sprite.m79" target="_blank" className="work-btn">จ้างทำเว็บไซต์บน Fastwork <ArrowUpRight size={16}/></a><span>© 2025 RateHub · Made with care in Thailand</span></div></footer>
  </main>;
}
