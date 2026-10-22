// Original scene artwork. All seven layers use a shared 300 x 185 canvas.
const ink='#5b4b40',paper='#fff9eb',orange='#dca16c',dark='#75655e',rose='#dda5a1',sage='#afbd95',gold='#efd18a'
const p=(d,fill='none')=>`<path d="${d}" fill="${fill}"/>`
const c=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`
const pose=(content,transform)=>`<g transform="${transform}">${content}</g>`
const head='M108 91 Q94 76 104 54 L101 26 L122 43 Q140 36 157 43 L180 26 L177 55 Q188 80 173 94 Q143 108 108 91Z'
function face(mouth) {
  return `<defs><clipPath id="face"><path d="${head}"/></clipPath></defs>`+p(head,paper)+
    `<g clip-path="url(#face)" stroke="none">`+
    p('M98 20 L139 28 Q143 45 133 56 Q125 60 127 75 Q108 84 99 65Z',orange)+
    p('M152 21 L188 19 L185 64 Q168 73 157 58 Q151 45 152 21Z',dark)+'</g>'+p(head)+
    p('M105 32 L116 43 M175 32 L162 44 M108 75 L119 77 M163 77 L178 73 M109 84 L119 81 M163 82 L177 87')+
    p('M136 74 Q141 71 146 74 L141 78Z',rose)+p(mouth)+
    `<g stroke="none" opacity=".55">${c(118,77,3.5,rose)+c(164,77,3.5,rose)}</g>`
}
const shoulders=p('M111 98 Q92 119 103 149 Q140 161 176 147 Q185 123 166 99Z',paper)+
  p('M159 109 Q181 117 174 145 Q153 150 155 129Z',orange)+p('M104 117 Q118 116 115 136 L102 139Z',dark)
const transforms={journal:'translate(2 5) rotate(10 141 70)',wealth:'translate(16 -2) rotate(-8 141 70)',record:'translate(-3 7) rotate(-13 141 70)'}
const mouths={journal:'M141 78 Q138 83 133 82 M141 78 Q146 82 151 80',wealth:'M141 78 Q135 89 128 81 M141 78 Q149 89 156 80',record:'M141 78 Q136 85 130 80 M141 78 Q146 86 153 81'}
const bodies=Object.fromEntries(Object.keys(transforms).map(scene=>[scene,shoulders+pose(face(mouths[scene]),transforms[scene])]))
const eyes={
  journal:pose(p('M122 66 Q127 70 132 66 M152 66 Q157 70 162 65')+c(129,68,1,ink)+c(158,67,1,ink),transforms.journal),
  wealth:pose(p('M121 68 Q126 59 132 67 M151 67 Q157 59 163 66'),transforms.wealth),
  record:pose(c(126,66,3.1,ink)+c(156,65,3.1,ink)+c(125,65,.9,paper)+c(155,64,.9,paper)+p('M121 57 L130 56 M151 56 L160 58'),transforms.record)
}
const closed={
  journal:pose(p('M122 67 Q127 70 132 67 M152 67 Q157 70 162 66'),transforms.journal),
  wealth:pose(p('M121 67 Q127 70 132 66 M151 66 Q157 69 163 65'),transforms.wealth),
  record:pose(c(126,66,3.1,ink)+c(125,65,.9,paper)+p('M152 64 L158 66 L152 69'),transforms.record)
}
const tail=p('M174 139 Q202 157 206 132 Q209 115 196 114 Q185 114 191 125')
  .replace('/>',' stroke-width="9"/>')+
  `<path d="M174 139 Q202 157 206 132 Q209 115 196 114 Q185 114 191 125" fill="none" stroke="${orange}" stroke-width="5"/>`+
  `<path d="M197 114 Q185 114 191 125" fill="none" stroke="${dark}" stroke-width="5"/>`
const tails={journal:pose(tail,'translate(8 0)'),wealth:pose(tail,'translate(34 -1) rotate(-12 174 139)'),record:pose(tail,'translate(-18 4) rotate(12 174 139)')}
const baseline=p('M17 165 Q148 158 286 165')
const background={
  journal:baseline+p('M22 145 L80 145 L80 160 L21 160Z',sage)+p('M26 131 L88 133 L85 145 L23 145Z',rose)+p('M29 119 L80 118 L86 132 L24 132Z',gold)+p('M28 151 L72 151 M33 137 L77 138')+p('M257 122 L278 124 L275 149 Q267 155 258 148Z',rose)+p('M279 127 Q291 124 288 135 L277 139 M264 116 Q259 110 265 105'),
  wealth:baseline+p('M38 105 L78 97 L86 127 L45 135Z',sage)+c(62,117,7,paper)+p('M62 112 L62 122 M58 115 L66 115 M59 119 L65 119')+p('M259 86 L263 76 L266 85 L275 89 L266 91 L263 101 L260 92 L251 89Z',gold),
  record:baseline+p('M33 137 L78 132 L82 157 L36 162Z',sage)+p('M42 143 L68 140 M43 151 L71 148')+p('M251 130 L276 130 L273 151 Q261 157 253 150Z',rose)+p('M277 134 Q289 131 286 142 L275 145 M248 158 L280 158 M260 123 Q254 117 261 112')
}
const foreground={
  journal:p('M89 129 Q119 119 153 132 Q188 119 222 130 L225 166 Q188 157 153 171 Q120 158 88 166Z',paper)+p('M153 134 L153 169 M98 137 Q117 133 136 139 M98 146 Q115 141 137 148 M99 155 L123 155 M168 141 L179 139 M169 151 L186 148')+p('M151 170 L147 178 L157 175 L161 179 L163 168',rose)+p('M106 124 Q103 117 111 115 Q123 116 126 126 Q117 132 106 124Z',paper)+p('M112 120 L113 125 M118 121 L119 126'),
  wealth:p('M109 123 Q107 103 166 103 Q222 103 231 122Z',sage)+p('M109 124 L231 123 L228 165 L112 167Z',rose)+p('M126 109 L127 165 M212 108 L211 165 M110 129 L229 129')+p('M159 122 L179 122 L179 145 L159 146Z',gold)+c(169,133,2,ink)+p('M124 113 Q120 104 129 102 Q140 102 146 114 Q140 121 124 113Z',paper)+p('M130 107 L131 114 M136 108 L137 114')+p('M39 151 L39 161 Q61 168 84 160 L84 150Z',gold)+p('M39 151 Q62 143 84 150 Q62 158 39 151Z',gold)+p('M43 141 L43 151 Q63 159 87 150 L87 140Z',gold)+p('M43 141 Q64 133 87 140 Q65 149 43 141Z',gold),
  record:pose(p('M97 104 L231 105 L232 166 L96 166Z',sage)+p('M106 109 L227 111 L225 161 L104 161Z',paper)+p('M111 104 L111 166 M95 116 L105 116 M95 129 L105 129 M95 143 L105 143 M95 156 L105 156 M122 120 L170 121 M122 131 L162 132 M122 143 L154 144 M174 152 L207 153')+p('M191 118 L201 118 L201 128 L191 128Z',gold),'rotate(4 166 136)')+p('M109 105 Q106 98 114 96 Q125 97 127 107 Q119 113 109 105Z',paper)+p('M115 100 L116 106 M121 101 L122 107')
}
const paws={
  journal:p('M168 111 Q175 107 181 115 L194 133 Q198 143 188 145 Q183 144 181 137 L168 122Z',paper)+p('M178 126 L185 132 M182 124 L189 130')+p('M185 137 L206 111 L212 116 L192 143 L186 147Z',gold)+p('M185 137 L192 143 M186 147 L192 143',ink)+p('M203 115 L209 120'),
  wealth:p('M178 105 Q189 104 194 114 L203 124 Q202 132 193 131 L182 121 Q175 118 178 105Z',paper)+c(202,112,13,gold)+c(202,112,9,'none')+p('M198 110 L206 110 M198 115 L206 115 M202 106 L202 119')+p('M187 115 Q186 108 193 110 L200 116 Q202 122 196 123Z',paper)+p('M191 114 L197 119'),
  record:p('M168 103 Q176 96 183 102 L198 114 Q202 122 194 127 Q187 128 185 120 L171 115Z',paper)+p('M188 116 L193 121 M192 113 L197 118')+pose(p('M204 97 L210 95 L224 150 L222 160 L215 153Z',gold)+p('M204 97 L203 91 L209 89 L210 95Z',rose)+p('M215 153 L224 150 M222 160 L219 154',ink)+p('M207 102 L210 113'),'translate(-10 0)')
}
module.exports=Object.fromEntries(['journal','wealth','record'].map(scene=>[scene,{
  scene:background[scene],tail:tails[scene],body:bodies[scene],
  'eyes-open':eyes[scene],'eyes-closed':closed[scene],foreground:foreground[scene],paw:paws[scene]
}]))
