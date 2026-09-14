import re

with open('src/index.css', 'r') as f:
    css = f.read()

tokens_insert = """
  --text: #f0ece4;
  --muted: rgba(240,236,228,.4);
  --purple: #7e14ff;
  --cyan: #47bfff;
"""
css = re.sub(r'\s*--text: #f0ece4;\s*--muted: rgba\(240,236,228,\.4\);', tokens_insert, css)

css = css.replace('.nav-logo-mark {\n  width: 22px; height: 22px;\n  background: var(--text);', '.nav-logo-mark {\n  width: 22px; height: 22px;\n  background: var(--purple);')
css = css.replace('.nav-cta a:hover { border-color: var(--text); background: rgba(255,255,255,.1); }', '.nav-cta a:hover { border-color: var(--purple); background: rgba(126,20,255,.1); }')

css = css.replace('background: var(--text);\n  color: var(--bg);', 'background: var(--purple);\n  color: #fff;')
css = css.replace('.hero-cta:hover { background: #ffffff; transform: translateY(-2px); }', '.hero-cta:hover { background: #9333ff; transform: translateY(-2px); }')
css = css.replace('.hero-cta-ghost:hover { border-color: var(--text); transform: translateY(-2px); }', '.hero-cta-ghost:hover { border-color: var(--cyan); transform: translateY(-2px); }')

css = css.replace('.scrub-progress-bar {\n  position: absolute;\n  bottom: 0; left: 0;\n  height: 2px;\n  background: var(--text);', '.scrub-progress-bar {\n  position: absolute;\n  bottom: 0; left: 0;\n  height: 2px;\n  background: var(--purple);')
css = css.replace('.manifesto-overline {\n  font-size: var(--t-xs);\n  letter-spacing: .22em;\n  text-transform: uppercase;\n  color: var(--text);', '.manifesto-overline {\n  font-size: var(--t-xs);\n  letter-spacing: .22em;\n  text-transform: uppercase;\n  color: var(--purple);')
css = css.replace('.manifesto-link:hover { border-color: var(--text); gap: 1.2rem; }', '.manifesto-link:hover { border-color: var(--purple); gap: 1.2rem; }')
css = css.replace('.marquee-item .dot {\n  width: 5px; height: 5px;\n  border-radius: 50%;\n  background: var(--text);', '.marquee-item .dot {\n  width: 5px; height: 5px;\n  border-radius: 50%;\n  background: var(--purple);')
css = css.replace('.stat-value .stat-accent { color: var(--text); }', '.stat-value .stat-accent { color: var(--purple); }')
css = css.replace('.protocol-card::after {\n  content: \'\';\n  position: absolute;\n  top: 0; left: 0; right: 0;\n  height: 2px;\n  background: linear-gradient(90deg, transparent, var(--text), transparent);', '.protocol-card::after {\n  content: \'\';\n  position: absolute;\n  top: 0; left: 0; right: 0;\n  height: 2px;\n  background: linear-gradient(90deg, transparent, var(--purple), transparent);')

css = css.replace('.live-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: .5rem;\n  padding: .35rem 1rem;\n  border: 1px solid var(--border);\n  border-radius: 100px;\n  font-size: var(--t-xs);\n  letter-spacing: .12em;\n  text-transform: uppercase;\n  color: var(--text);\n  margin-bottom: 2.5rem;\n  background: rgba(255,255,255,.02);\n}', '.live-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: .5rem;\n  padding: .35rem 1rem;\n  border: 1px solid rgba(71,191,255,.25);\n  border-radius: 100px;\n  font-size: var(--t-xs);\n  letter-spacing: .12em;\n  text-transform: uppercase;\n  color: var(--cyan);\n  margin-bottom: 2.5rem;\n  background: rgba(71,191,255,.05);\n}')
css = css.replace('.live-badge .pulse {\n  width: 6px; height: 6px;\n  border-radius: 50%;\n  background: var(--text);', '.live-badge .pulse {\n  width: 6px; height: 6px;\n  border-radius: 50%;\n  background: var(--cyan);')

css = css.replace('.btn-primary:hover { background: #ffffff; transform: translateY(-3px); }', '.btn-primary:hover { background: #9333ff; transform: translateY(-3px); }')
css = css.replace('.btn-outline:hover { border-color: var(--text); transform: translateY(-3px); }', '.btn-outline:hover { border-color: var(--purple); transform: translateY(-3px); }')
css = css.replace('.footer-logo-mark {\n  width: 18px; height: 18px;\n  background: var(--text);', '.footer-logo-mark {\n  width: 18px; height: 18px;\n  background: var(--purple);')

css = css.replace('::selection { background: var(--text); color: #0e0e0c; }', '::selection { background: var(--purple); color: #fff; }')
css = css.replace('::-webkit-scrollbar-thumb { background: var(--text); border-radius: 99px; }', '::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 99px; }')

glow_orb_css = """
/* ─── Glow Orbs ──────────────────────────────────────── */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(120px);
  opacity: .2;
}
.glow-orb-1 {
  width: 600px; height: 600px;
  background: var(--purple);
  top: -200px; left: -100px;
  animation: orbFloat 12s ease-in-out infinite;
}
.glow-orb-2 {
  width: 500px; height: 500px;
  background: var(--cyan);
  bottom: -200px; right: -100px;
  animation: orbFloat 16s ease-in-out infinite reverse;
}
@keyframes orbFloat {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(.95); }
}
"""

css += glow_orb_css

with open('src/index.css', 'w') as f:
    f.write(css)

print('Restored Original Design CSS!')
