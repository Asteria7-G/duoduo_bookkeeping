"""Bundle a Chinese handwriting subset as an offline WXSS font face."""
import base64
import hashlib
import json
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'design/references/font-tools'))
from fontTools import subset
from fontTools.ttLib import TTFont

source = next((root / 'design/references/font-source/marker').rglob('LXGWMarkerGothic-Regular.ttf'))
characters = set(chr(i) for i in range(32, 0x250))
for start, end in [(0x2000, 0x2070), (0x3000, 0x3040), (0xFF00, 0xFFF0)]:
    characters.update(chr(i) for i in range(start, end))
for lead in range(0xB0, 0xF8):
    for trail in range(0xA1, 0xFF):
        try:
            characters.add(bytes([lead, trail]).decode('gb2312'))
        except UnicodeDecodeError:
            pass
for folder in ['pages', 'store', 'utils', 'components', 'custom-tab-bar']:
    for file in (root / folder).rglob('*'):
        if file.suffix in ['.js', '.wxml']:
            characters.update(file.read_text(encoding='utf-8'))
font = TTFont(source)
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=''.join(sorted(characters)))
subsetter.subset(font)
for entry in font['name'].names:
    replacement = {1:'Dodo Journal Hand', 2:'Regular', 3:'DodoJournalHand-Subset-v1',
                   4:'Dodo Journal Hand', 6:'DodoJournalHand-Regular'}.get(entry.nameID)
    if replacement:
        entry.string = replacement.encode(entry.getEncoding())
font.flavor = 'woff2'
font.recalcTimestamp = False
fonts = root / 'assets/fonts'
fonts.mkdir(parents=True, exist_ok=True)
temp = root / 'design/references/font-source/dodo-hand.woff2'
font.save(temp)
data = temp.read_bytes()
(root / 'theme/handwriting.wxss').write_text(
    '/* GB2312 + UI subset of LXGW Marker Gothic v1.004; SIL OFL 1.1, see assets/fonts/OFL.txt. */\n'
    '@font-face { font-family:"DodoHand"; src:url("data:font/woff2;base64,'
    + base64.b64encode(data).decode('ascii') + '") format("woff2"); font-style:normal; font-weight:normal; font-display:swap; }\n',
    encoding='utf-8')
license_file = next((root / 'design/references/font-source/marker').rglob('OFL.txt'))
(fonts / 'OFL.txt').write_text('\n'.join(line.rstrip() for line in license_file.read_text(encoding='utf-8').splitlines()) + '\n', encoding='utf-8')
(fonts / 'NOTICE.md').write_text(
    '# Dodo Journal Hand\n\n'
    'An offline web-font subset of [LXGW Marker Gothic v1.004](https://github.com/lxgw/LxgwMarkerGothic/releases/tag/v1.004), '
    'derived from Tanugo. Copyright notices and the complete SIL Open Font License 1.1 are in OFL.txt.\n\n'
    'Subset and family renaming by Dodo Bookkeeping. Original glyph outlines retained. '
    'Includes GB2312 Chinese, Latin, punctuation and all application UI characters. '
    'Characters outside the subset use the platform fallback font. '
    'The WOFF2 font is embedded once in theme/handwriting.wxss; it makes no network requests.\n', encoding='utf-8')
(fonts / 'manifest.json').write_text(json.dumps({'family':'DodoHand', 'source':'LXGW Marker Gothic v1.004',
    'license':'OFL-1.1', 'glyphs':len(font.getBestCmap()), 'woff2Bytes':len(data),
    'sha256':hashlib.sha256(data).hexdigest()}, indent=2) + '\n', encoding='utf-8')
print(f'Offline handwriting font: {len(font.getBestCmap())} characters; {len(data)} WOFF2 bytes')
