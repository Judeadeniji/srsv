import re

with open('src/index.css', 'r') as f:
    css = f.read()

# Fix hero-cta
css = css.replace('padding: 1rem 2.2rem;', 'padding: .6rem 1.4rem;')
css = re.sub(r'(\.hero-cta(?:-ghost)?\s*\{[^}]*)gap:\s*\.75rem;', r'\1gap: .5rem;', css)

# Fix btn-primary and btn-outline
css = css.replace('padding: 1.1rem 2.6rem;', 'padding: .6rem 1.4rem;')
css = re.sub(r'(\.btn-(?:primary|outline)\s*\{[^}]*)gap:\s*\.75rem;', r'\1gap: .5rem;', css)

with open('src/index.css', 'w') as f:
    f.write(css)
print("Button sizes reduced!")
