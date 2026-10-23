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
const transforms={journal:'translate(2 5) rotate(10 141 70)',wealth:'translate(16 -2) rotate(-8 141 70)',record:'translate(-3 3) rotate(-5 141 70)'}
const mouths={journal:'M141 78 Q138 83 133 82 M141 78 Q146 82 151 80',wealth:'M141 78 Q135 89 128 81 M141 78 Q149 89 156 80',record:'M141 78 Q136 85 130 80 M141 78 Q146 86 153 81'}
const bodies=Object.fromEntries(Object.keys(transforms).map(scene=>[scene,shoulders+pose(face(mouths[scene]),transforms[scene])]))
const eyes={
  journal:pose(p('M122 66 Q127 70 132 66 M152 66 Q157 70 162 65')+c(129,68,1,ink)+c(158,67,1,ink),transforms.journal),
  wealth:pose(p('M121 68 Q126 59 132 67 M151 67 Q157 59 163 66'),transforms.wealth),
  record:pose('<g stroke="none">'+c(126,66,3.1,ink)+c(156,65,3.1,ink)+c(125,65,.9,paper)+c(155,64,.9,paper)+'</g>'+p('M121 57 L130 56 M151 56 L160 58'),transforms.record)
}
const closed={
  journal:pose(p('M122 67 Q127 70 132 67 M152 67 Q157 70 162 66'),transforms.journal),
  wealth:pose(p('M121 67 Q127 70 132 66 M151 66 Q157 69 163 65'),transforms.wealth),
  record:pose('<g stroke="none">'+c(126,66,3.1,ink)+c(125,65,.9,paper)+'</g>'+p('M152 64 L158 66 L152 69'),transforms.record)
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
  record:baseline+pose(p('M35 119 L74 119 L74 160 L35 160Z',paper)+p('M39 123 L70 123 L70 148 L39 148Z',sage)+c(62,131,3.5,gold)+p('M40 146 L49 135 L58 144 L64 138 L70 146',paper)+p('M45 154 L62 154'),'rotate(-9 55 140)')+c(252,151,11,dark)+p('M247 146 L257 156 M247 156 L257 146')+p('M229 91 L232 84 L235 91 L242 94 L235 96 L232 103 L229 96 L222 94Z',gold)
}
const foreground={
  journal:p('M89 129 Q119 119 153 132 Q188 119 222 130 L225 166 Q188 157 153 171 Q120 158 88 166Z',paper)+p('M153 134 L153 169 M98 137 Q117 133 136 139 M98 146 Q115 141 137 148 M99 155 L123 155 M168 141 L179 139 M169 151 L186 148')+p('M151 170 L147 178 L157 175 L161 179 L163 168',rose)+p('M106 124 Q103 117 111 115 Q123 116 126 126 Q117 132 106 124Z',paper)+p('M112 120 L113 125 M118 121 L119 126'),
  wealth:p('M109 123 Q107 103 166 103 Q222 103 231 122Z',sage)+p('M109 124 L231 123 L228 165 L112 167Z',rose)+p('M126 109 L127 165 M212 108 L211 165 M110 129 L229 129')+p('M159 122 L179 122 L179 145 L159 146Z',gold)+c(169,133,2,ink)+p('M124 113 Q120 104 129 102 Q140 102 146 114 Q140 121 124 113Z',paper)+p('M130 107 L131 114 M136 108 L137 114')+p('M39 151 L39 161 Q61 168 84 160 L84 150Z',gold)+p('M39 151 Q62 143 84 150 Q62 158 39 151Z',gold)+p('M43 141 L43 151 Q63 159 87 150 L87 140Z',gold)+p('M43 141 Q64 133 87 140 Q65 149 43 141Z',gold),
  record:p('M112 145 Q101 144 101 154 Q104 163 126 156 L129 150 M153 151 Q161 144 172 147 Q182 150 178 157 Q166 163 151 157',paper)+p('M110 153 L110 157 M117 152 L117 157 M165 152 L165 157 M172 151 L172 156')
}
const paws={
  journal:p('M168 111 Q175 107 181 115 L194 133 Q198 143 188 145 Q183 144 181 137 L168 122Z',paper)+p('M178 126 L185 132 M182 124 L189 130')+p('M185 137 L206 111 L212 116 L192 143 L186 147Z',gold)+p('M185 137 L192 143 M186 147 L192 143',ink)+p('M203 115 L209 120'),
  wealth:p('M178 105 Q189 104 194 114 L203 124 Q202 132 193 131 L182 121 Q175 118 178 105Z',paper)+c(202,112,13,gold)+c(202,112,9,'none')+p('M198 110 L206 110 M198 115 L206 115 M202 106 L202 119')+p('M187 115 Q186 108 193 110 L200 116 Q202 122 196 123Z',paper)+p('M191 114 L197 119'),
  record:`<path d="M119 100 L127 124 M163 100 L157 124" fill="none" stroke="${rose}" stroke-width="4"/>`+
    p('M120 118 L131 118 L134 112 L149 112 L152 118 L169 118 Q175 118 175 124 L174 147 Q174 152 168 152 L122 152 Q116 152 116 146 L116 124 Q116 119 120 118Z',sage)+
    p('M121 123 L132 123 L132 128 L121 128Z',paper)+p('M137 115 L146 115')+c(165,117,2.6,rose)+
    c(146,136,12,gold)+c(146,136,9,dark)+c(146,136,6,'#aac3cc')+c(148,133,2,paper)+p('M142 140 Q146 143 150 139')+
    p('M110 109 Q103 114 110 122 L122 133 Q129 136 132 130 Q134 125 126 121 L118 111Z',paper)+p('M122 126 L127 131 M125 123 L130 128')+
    p('M166 104 Q176 107 172 114 L168 121 Q165 125 160 121 Q157 118 161 115 L161 108Z',paper)+p('M163 115 L167 118 M166 112 L170 115')
}
module.exports=Object.fromEntries(['journal','wealth','record'].map(scene=>[scene,{
  scene:background[scene],tail:tails[scene],body:bodies[scene],
  'eyes-open':eyes[scene],'eyes-closed':closed[scene],foreground:foreground[scene],paw:paws[scene]
}]))
