/* ====================== Avatars dessinés (V6) ====================== */
const AVCACHE=new Map();
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=x=>Math.max(0,Math.min(255,Math.round(k<0?x*(1+k):x+(255-x)*k)));return'#'+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function avSVG(v){if(!v)v=D.avRandom(1);const key=JSON.stringify(v);if(AVCACHE.has(key))return AVCACHE.get(key);
  const sk=D.AVC.skin[v.skin]||D.AVC.skin[1],skd=shade(sk,-.18),hc=D.AVC.hairC[v.hairC]||'#1c1412',tc=D.AVC.topC[v.topC]||'#1a1a22',bg=D.AVC.bg[v.bg]||'#2a1d33',tcd=shade(tc,-.25);
  const mask=v.hat==='masque';let s=`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="${bg}"/>`;
  // cheveux derrière
  if(!mask){if(v.hair==='long')s+=`<path d="M27 44C23 70 29 86 36 90L64 90C71 86 77 70 73 44Z" fill="${hc}"/>`;
    if(v.hair==='afro')s+=`<circle cx="50" cy="38" r="30" fill="${hc}"/>`;
    if(v.hair==='queue')s+=`<path d="M68 30C82 34 84 52 78 66C76 56 72 46 66 40Z" fill="${hc}"/>`;
    if(v.hair==='tresses')s+=`<path d="M27 42L25 84L33 84L34 46ZM73 42L75 84L67 84L66 46Z" fill="${hc}"/><path d="M26 52H33M26 60H33M26 68H33M26 76H33M67 52H74M67 60H74M67 68H74M67 76H74" stroke="${shade(hc,-.35)}" stroke-width="1.5"/>`}
  // corps
  if(v.top==='debardeur'){s+=`<path d="M12 104C14 82 30 74 50 74C70 74 86 82 88 104Z" fill="${sk}"/><path d="M30 104C32 84 38 77 42 75L58 75C62 77 68 84 70 104Z" fill="${tc}"/>`}
  else s+=`<path d="M12 104C14 80 30 72 50 72C70 72 86 80 88 104Z" fill="${v.top==='smoking'?'#16141a':tc}"/>`;
  s+=`<path d="M43 60H57V75Q50 79 43 75Z" fill="${skd}"/>`;
  if(v.top==='tshirt')s+=`<path d="M42 73Q50 80 58 73" fill="none" stroke="${tcd}" stroke-width="2.5"/>`;
  if(v.top==='sweat')s+=`<path d="M32 76Q50 90 68 76" fill="none" stroke="${tcd}" stroke-width="5"/><path d="M46 80V90M54 80V90" stroke="#f2f0ea" stroke-width="1.6" stroke-linecap="round"/>`;
  if(v.top==='survet')s+=`<path d="M50 76V104" stroke="${tcd}" stroke-width="1.5"/><path d="M22 86L34 77M78 86L66 77" stroke="#f2f0ea" stroke-width="2.4"/><path d="M24 90L36 80M76 90L64 80" stroke="#f2f0ea" stroke-width="2.4"/>`;
  if(v.top==='chemise')s+=`<path d="M43 72L50 82L39 80ZM57 72L50 82L61 80Z" fill="${shade(tc,.6)}"/><circle cx="50" cy="88" r="1.3" fill="${tcd}"/><circle cx="50" cy="96" r="1.3" fill="${tcd}"/>`;
  if(v.top==='costume'||v.top==='smoking'){s+=`<path d="M43 73L50 98L57 73Z" fill="#f4f2ee"/><path d="M42 73L50 98L36 82ZM58 73L50 98L64 82Z" fill="${v.top==='smoking'?'#2a2830':tcd}"/>`;
    s+=v.top==='smoking'?`<path d="M44 76L50 79L56 76L56 82L50 79L44 82Z" fill="#111"/>`:`<path d="M48.5 76H51.5L53 90L50 94L47 90Z" fill="#c3343a"/>`}
  // tête
  if(!mask){s+=`<circle cx="29" cy="47" r="5" fill="${sk}"/><circle cx="71" cy="47" r="5" fill="${sk}"/>`}
  s+=v.shape==='rond'?`<circle cx="50" cy="45" r="22.5" fill="${sk}"/>`:v.shape==='carre'?`<rect x="28.5" y="22" width="43" height="46" rx="14" fill="${sk}"/>`:`<ellipse cx="50" cy="44" rx="20.5" ry="24" fill="${sk}"/>`;
  if(mask)s+=`<path d="M27 46C26 20 40 14 50 14C60 14 74 20 73 46C73 64 64 70 50 70C36 70 27 64 27 46Z" fill="#16141a"/><ellipse cx="50" cy="46" rx="15" ry="6.5" fill="${sk}"/><ellipse cx="50" cy="60" rx="6" ry="4" fill="${sk}"/><path d="M27 34H73" stroke="#c3343a" stroke-width="3"/>`;
  else{s+=`<circle cx="39" cy="54" r="3.4" fill="#ff7a8a" opacity=".22"/><circle cx="61" cy="54" r="3.4" fill="#ff7a8a" opacity=".22"/>`;
    // cheveux devant
    const H={court:`<path d="M29 42C28 24 40 17 51 17C63 17 73 25 71 42C67 33 60 28 50 29C41 29 33 33 29 42Z" fill="${hc}"/>`,
      degrade:`<path d="M30 40C30 24 41 18 50 18C60 18 71 24 70 40C66 30 58 26 50 26C42 26 34 30 30 40Z" fill="${hc}"/><path d="M29 44C28 36 30 32 31 30M71 44C72 36 70 32 69 30" stroke="${hc}" stroke-width="3" opacity=".5"/>`,
      rase:`<path d="M29 42C28 24 40 18 51 18C63 18 73 25 71 42C67 31 60 27 50 27C41 27 33 31 29 42Z" fill="${hc}" opacity=".45"/>`,
      boucles:[[31,38,6],[35,29,7],[43,23,7.5],[52,21,8],[61,24,7.5],[67,31,6.5],[70,39,5]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${hc}"/>`).join(''),
      afro:[[30,40,7],[33,29,8],[42,22,8.5],[52,20,9],[62,22,8.5],[68,30,8],[71,40,7]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${hc}"/>`).join(''),
      long:`<path d="M29 46C27 24 40 18 50 18C62 18 73 25 71 46C65 34 57 29 47 30C39 31 32 37 29 46Z" fill="${hc}"/>`,
      queue:`<path d="M29 42C28 24 40 17 51 17C63 17 73 25 71 42C67 31 58 27 49 28C41 29 33 33 29 42Z" fill="${hc}"/>`,
      chignon:`<circle cx="50" cy="15" r="8" fill="${hc}"/><path d="M29 42C28 24 40 18 51 18C63 18 73 25 71 42C67 31 58 27 49 28C41 29 33 33 29 42Z" fill="${hc}"/>`,
      meche:`<path d="M28 44C26 22 46 14 60 18C70 21 74 30 72 42C66 30 52 26 40 34C36 37 31 40 28 44Z" fill="${hc}"/>`,
      tresses:`<path d="M29 42C28 24 40 17 51 17C63 17 73 25 71 42C67 31 58 27 49 28C41 29 33 33 29 42Z" fill="${hc}"/><path d="M40 19L38 29M50 17V28M60 19L62 29" stroke="${shade(hc,-.35)}" stroke-width="1.4"/>`,
      crete:`<path d="M29 42C28 26 40 19 51 19C63 19 73 26 71 42C67 31 60 27 50 27C41 27 33 31 29 42Z" fill="${hc}" opacity=".35"/><path d="M45 28C44 14 48 7 50 4C52 7 56 14 55 28Z" fill="${hc}"/>`,
      chauve:`<ellipse cx="42" cy="28" rx="6" ry="3" fill="#ffffff" opacity=".25"/>`};
    s+=H[v.hair]||''}
  // sourcils, yeux, nez
  const bw=v.brows==='epais'?3.4:2.2,bc=mask?'#16141a':shade(hc,-.1);
  if(!mask){const B={normaux:'M37 39Q42 36.5 46 38.5M63 39Q58 36.5 54 38.5',fronces:'M37 37.5L46 40.5M63 37.5L54 40.5',leves:'M37 37Q42 32.5 46 35.5M63 37Q58 32.5 54 35.5',epais:'M37 39Q42 36 46 38.5M63 39Q58 36 54 38.5'};
    s+=`<path d="${B[v.brows]||B.normaux}" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`}
  const E={normal:`<circle cx="42" cy="46" r="2.7" fill="#1a1414"/><circle cx="58" cy="46" r="2.7" fill="#1a1414"/><circle cx="42.9" cy="45.1" r=".9" fill="#fff"/><circle cx="58.9" cy="45.1" r=".9" fill="#fff"/>`,
    grands:`<ellipse cx="42" cy="46" rx="4.2" ry="4.6" fill="#fff"/><ellipse cx="58" cy="46" rx="4.2" ry="4.6" fill="#fff"/><circle cx="42.6" cy="46.6" r="2.4" fill="#1a1414"/><circle cx="58.6" cy="46.6" r="2.4" fill="#1a1414"/>`,
    plisses:`<path d="M38 46.5Q42 43.5 46 46.5M54 46.5Q58 43.5 62 46.5" stroke="#1a1414" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    clin:`<circle cx="42" cy="46" r="2.7" fill="#1a1414"/><circle cx="42.9" cy="45.1" r=".9" fill="#fff"/><path d="M54 46Q58 49 62 46" stroke="#1a1414" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    dollars:`<text x="42" y="49.5" text-anchor="middle" font-size="10" font-weight="800" font-family="sans-serif" fill="#2f9e6a">$</text><text x="58" y="49.5" text-anchor="middle" font-size="10" font-weight="800" font-family="sans-serif" fill="#2f9e6a">$</text>`};
  s+=E[v.eyes]||E.normal;
  if(!mask)s+=`<path d="M50 48Q47.5 53.5 51 54.5" stroke="${skd}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  // barbe
  if(!mask){const bh=v.beard;if(bh==='barbe3j')s+=`<path d="M30 50C31 66 40 72 50 72C60 72 69 66 70 50C66 60 60 64 50 64C40 64 34 60 30 50Z" fill="${hc}" opacity=".32"/>`;
    if(bh==='barbe')s+=`<path d="M29 48C29 68 39 74 50 74C61 74 71 68 71 48C67 58 61 62 50 62C39 62 33 58 29 48Z" fill="${hc}"/>`;
    if(bh==='moustache'||bh==='bouc'||bh==='barbe')s+=`<path d="M42 57Q50 53 58 57Q54 59.5 50 57.5Q46 59.5 42 57Z" fill="${hc}"/>`;
    if(bh==='bouc')s+=`<path d="M45.5 63Q50 72 54.5 63Z" fill="${hc}"/>`}
  // bouche
  const M={sourire:`<path d="M43.5 59.5Q50 65 56.5 59.5" stroke="#5a2a22" stroke-width="2" fill="none" stroke-linecap="round"/>`,neutre:`<path d="M45 61H55" stroke="#5a2a22" stroke-width="2" stroke-linecap="round"/>`,
    rire:`<path d="M42.5 58.5Q50 69 57.5 58.5Z" fill="#4a1a18"/><path d="M44 59H56L55.5 60.5H44.5Z" fill="#fff"/>`,moue:`<path d="M45 62Q50 58 55 62" stroke="#5a2a22" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    langue:`<path d="M43.5 59.5Q50 65 56.5 59.5" stroke="#5a2a22" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="52" cy="64" rx="3" ry="3.4" fill="#ff6b7a"/>`,
    dentor:`<path d="M42.5 58.5Q50 69 57.5 58.5Z" fill="#4a1a18"/><path d="M44 59H56L55.5 60.5H44.5Z" fill="#fff"/><rect x="51" y="59" width="3" height="2.2" fill="#f2c14e"/>`};
  s+=M[v.mouth]||M.sourire;
  // lunettes
  const G={rondes:`<g fill="rgba(255,255,255,.12)" stroke="#1a1414" stroke-width="1.6"><circle cx="42" cy="46" r="5.6"/><circle cx="58" cy="46" r="5.6"/></g><path d="M47.6 46H52.4" stroke="#1a1414" stroke-width="1.6"/>`,
    soleil:`<rect x="35" y="42" width="13.5" height="8.5" rx="3.5" fill="#111"/><rect x="51.5" y="42" width="13.5" height="8.5" rx="3.5" fill="#111"/><path d="M48.5 44.5H51.5" stroke="#111" stroke-width="2"/><path d="M37 44L41 44" stroke="#fff" stroke-width="1" opacity=".5"/>`,
    coeur:`<path d="M42 51L36.5 45.5A3.2 3.2 0 0 1 42 41.5A3.2 3.2 0 0 1 47.5 45.5Z" fill="#ff4d8a"/><path d="M58 51L52.5 45.5A3.2 3.2 0 0 1 58 41.5A3.2 3.2 0 0 1 63.5 45.5Z" fill="#ff4d8a"/>`,
    aviateur:`<g fill="rgba(70,45,10,.75)" stroke="#e3b558" stroke-width="1.4"><path d="M35 43H48.5L47 50Q42 53 37 50Z"/><path d="M51.5 43H65L63 50Q58 53 53 50Z"/></g><path d="M48.5 43.5H51.5" stroke="#e3b558" stroke-width="1.4"/>`,
    monocle:`<circle cx="58" cy="46" r="5.8" fill="rgba(255,255,255,.12)" stroke="#e3b558" stroke-width="1.6"/><path d="M63 50Q66 62 62 72" stroke="#e3b558" stroke-width=".9" fill="none"/>`};
  s+=G[v.glasses]||'';
  // chapeau
  const T={casquette:`<path d="M28 35C27 17 73 17 72 35Z" fill="${tc}"/><path d="M48 33L84 34Q82 39 64 38Z" fill="${tcd}"/><circle cx="50" cy="20" r="1.6" fill="${tcd}"/>`,
    casquette_env:`<path d="M28 35C27 17 73 17 72 35Z" fill="${tc}"/><path d="M30 33L18 34Q20 37 30 37Z" fill="${tcd}"/><rect x="45" y="28" width="10" height="5" rx="2" fill="${tcd}"/>`,
    bonnet:`<path d="M27 38C25 14 75 14 73 38Z" fill="${tc}"/><rect x="26" y="32" width="48" height="8" rx="3" fill="${tcd}"/><circle cx="50" cy="12" r="5" fill="${shade(tc,.5)}"/>`,
    bob:`<path d="M31 33C31 17 69 17 69 33Z" fill="${tc}"/><ellipse cx="50" cy="33.5" rx="27" ry="5.5" fill="${tcd}"/>`,
    chapeau:`<ellipse cx="50" cy="31" rx="31" ry="5.5" fill="#1f1d22"/><path d="M34 31C33 15 67 15 66 31Z" fill="#2a282e"/><rect x="34" y="25" width="32" height="4" fill="#e3b558"/>`,
    couronne:`<path d="M30 30L33 12L41.5 22L50 7L58.5 22L67 12L70 30Z" fill="#f2c14e" stroke="#9a6512" stroke-width="1.2"/><circle cx="50" cy="24" r="2.6" fill="#c3343a"/><circle cx="39" cy="26" r="1.8" fill="#4cc9f0"/><circle cx="61" cy="26" r="1.8" fill="#4cc9f0"/>`};
  s+=T[v.hat]||'';
  // bijoux
  if(v.bling==='boucle'&&!mask)s+=`<circle cx="71" cy="53" r="1.9" fill="#f2c14e"/>`;
  if(v.bling==='chaine')s+=`<path d="M40 74Q50 89 60 74" stroke="#f2c14e" stroke-width="2.2" fill="none"/><circle cx="50" cy="86" r="2.6" fill="#f2c14e"/>`;
  if(v.bling==='chaine_xl')s+=`<path d="M38 73Q50 93 62 73" stroke="#f2c14e" stroke-width="3.6" fill="none" stroke-dasharray="3 1.2"/><circle cx="50" cy="91" r="6" fill="#f2c14e" stroke="#9a6512"/><text x="50" y="94" text-anchor="middle" font-size="8" font-weight="900" font-family="sans-serif" fill="#7a4f0c">$</text>`;
  s+='</svg>';AVCACHE.set(key,s);return s}
// avHTML garde la même signature : avHTML(taille, {face, acc, v2})
avHTML=function(size=64,a=S.av){const v=a&&a.v2;if(!v)return`<span class="avatar" style="--as:${size}px" aria-hidden="true">${a&&a.acc?`<span class="acc">${a.acc}</span>`:''}${a?a.face:'🙂'}</span>`;
  return`<span class="avatar av2" style="--as:${size}px" aria-hidden="true">${avSVG(v)}</span>`};
// petit avatar pour les listes : p.av (v2) ou p.face
function fc(p,size=26){if(p&&p.sys)return`<span class="avatar av2 sys" style="--as:${size}px" aria-hidden="true">${CROUP_SVG}</span>`;return p&&p.av?avHTML(size,{v2:p.av}):`<span class="fface">${p?p.face||'🙂':'🙂'}</span>`}
const CROUP_SVG=`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="#4a2a0c"/><path d="M12 104C14 80 30 72 50 72C70 72 86 80 88 104Z" fill="#16141a"/><path d="M43 73L50 98L57 73Z" fill="#f4f2ee"/><path d="M44 76L50 79L56 76L56 82L50 79L44 82Z" fill="#c3343a"/><ellipse cx="50" cy="44" rx="20.5" ry="24" fill="#ecc09c"/><path d="M29 40C28 24 40 18 51 18C63 18 73 25 71 40C67 31 60 27 50 27C41 27 33 31 29 40Z" fill="#d9d2c7"/><circle cx="42" cy="46" r="2.6" fill="#1a1414"/><circle cx="58" cy="46" r="2.6" fill="#1a1414"/><path d="M42 57Q50 53 58 57Q54 59.5 50 57.5Q46 59.5 42 57Z" fill="#d9d2c7"/><path d="M45 61Q50 64 55 61" stroke="#5a2a22" stroke-width="2" fill="none"/><ellipse cx="50" cy="31" rx="31" ry="5.5" fill="#1f1d22"/><path d="M34 31C33 15 67 15 66 31Z" fill="#2a282e"/><rect x="34" y="25" width="32" height="4" fill="#e3b558"/></svg>`;
