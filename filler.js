const gem_points = [[0,28,28,0,28,28],[28,28,56,28,28,0],[28,28,28,56,0,28],[28,28,56,28,28,56]]
const colors 	 = [
	['#FDFDFD','#A8A8A8','#A8A8A8','#6D6D6D'],  // 0 white
	['#FFFF51','#FFAA51','#FFAA51','#7B4100'],  // 1 yellow 
	['#53FD54','#05A801','#05A801','#096309'],  // 2 green
	['#53FDFD','#05A8A8','#05A8A8','#016F70'],  // 3 blue
	['#FF56FF','#AD00AD','#AD00AD','#730473'],  // 4 maroon
	['#FF5652','#AD0000','#AD0000','#7A0D11']]  // 5 red  
const buttons 	= [{text:'⬜', callback_data:'color0'},{text:'💛', callback_data:'color1'},{text:'💚', callback_data:'color2'},{text:'💙', callback_data:'color3'},{text:'💜', callback_data:'color4'},{text:'❤️', callback_data:'color5'}]
const yl=11, xl=41
const clone = arr => JSON.parse(JSON.stringify(arr))
const getColor = c => buttons[c]?.text
const getColorText = c => ['white','yellow','green','blue','maroon','red'][c]
const nears = (y,x) => [[y,x-1],[y,x+1],[y+(x%2?-1:1),x-1],[y+(x%2?-1:1),x+1]].filter(e => e[0]>=0 && e[0]<yl && e[1]>=0 && e[1]<xl && (e[1]%2<1 || e[0]) )
function getStepColor(field, player, level=0, time=Date.now(), delay=7000){
	const scores = calcScores(field)
	if (level>5 || scores.winner!=undefined || Date.now()-time > delay) return {scores:scores.scores[player-1]}
	let colors = scores.possible_colors[player-1].slice() // []
	if (!level) colors = colors.filter(e => !scores.used_colors.includes(e))
	if (!colors.length)	colors = [scores.unused_colors[Math.floor(Math.random()*scores.unused_colors.length)]]

	let max_score = 0, ptr = 0, sel_color
	for (let i=0; i<colors.length; i++){
		const board = nextStep(clone(field), player, colors[i])
		const data = getStepColor(board, player, level+1, time, delay)
		if (data.scores && data.scores>max_score){
			max_score = data.scores
			ptr = i
		}
	}
	return {color:colors[ptr], scores:max_score}
}
function nextStep(field, player, color){
	const fill_nears = (y, x, colors, level=0) => {
		for (const cell of nears(y,x)){
			if (colors.includes(next_field[cell[0]][cell[1]])){
				next_field[cell[0]][cell[1]] = next_field[y][x]
				fill_nears(cell[0], cell[1], colors, level+1)
			}
		}
	}
	let next_field = clone(field)
	const start = player<2 ? [yl-1, 0] : [0, xl-1]
	const prev_color = next_field[start[0]][start[1]]
	next_field[start[0]][start[1]] = player*10+color%10
	fill_nears(start[0], start[1], [color, prev_color])
	return next_field
}
function genBoard(){
	const field = []
	for (let i=0; i<yl; i++){
		field.push([])	
		for (let j=0; j<xl; j++) field[i].push(j%2 && !i ? 9 : Math.floor(Math.random()*colors.length))
	}
	while (field[yl-1][0]==field[yl-1][1]) field[yl-1][0] = Math.floor(Math.random()*colors.length)
	while (field[0][xl-1]==field[1][xl-2] || field[0][xl-1]==field[yl-1][0]) field[0][xl-1] = Math.floor(Math.random()*colors.length)
	field[yl-1][0] += 10
	field[0][xl-1] += 20
	return field
}
function calcScores(field){
	const result = {scores:[0,0], used_colors:[], unused_colors:[], possible_colors:[[],[]], total:0}
	for (let i=0; i<field.length; i++){
		for (let j=0; j<field[i].length; j++){
			if (j%2 && !i) continue
			result.total++
			if (field[i][j]>9) {
				const player = field[i][j]>19?1:0
				const used_color = field[i][j]%10
				if (!result.used_colors.includes(used_color)) result.used_colors.push(used_color)
				result.scores[player]++
				for (const c of nears(i,j))
					if (field[c[0]][c[1]]<10 && !result.possible_colors[player].includes(field[c[0]][c[1]])) result.possible_colors[player].push(field[c[0]][c[1]])
			}
		}
	}
	for (let c=0; c<colors.length; c++)
		if (!result.used_colors.includes(c)) result.unused_colors.push(c)
	result.kb = result.unused_colors.map(e => buttons[e])		
	if (result.scores[0] > result.total/2) result.winner = 0
	if (result.scores[1] > result.total/2) result.winner = 1
	return result
}
function genSVG(field){
	let source = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 1200 628" width="1200" height="628">\n<rect x="0" y="0" width="1200" height="628" fill="black" />\n'
	for (let i=0; i<yl; i++){
		for (let j=0; j<xl; j++){
			if (j%2 && !i) continue
			const y = i*56+6  - (j%2*28)
			const x = j*28+12
			let s = ''
			for (let k=0;k<4;k++)
				s += '<polygon points="'+(x+gem_points[k][0])+','+(y+gem_points[k][1])+' '+(x+gem_points[k][2])+','+(y+gem_points[k][3])+' '+(x+gem_points[k][4])+','+(y+gem_points[k][5])+'" style="fill:'+colors[field[i][j]%10][k]+';"/>' 
			source += s+'\n'
		}
	}	
	source += '</svg>'
	return source
}
module.exports = {genBoard,calcScores,genSVG,nextStep,getStepColor,getColor,clone}
