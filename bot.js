const fs 	  	= require('fs')
const dotenv 	= require('dotenv').config()
const crypto 	= require('crypto')
const fetch  	= require('node-fetch')
const filler 	= require('./filler')
const {Resvg} 	= require('@resvg/resvg-js')
const polka  	= require('polka')
const bParser	= require('body-parser')
const {encodeFunctionData, parseGwei, parseEther, getAddress} = require('viem')
const Telegraf	= require('telegraf')
const bot 		= new Telegraf(process.env.BOT_TOKEN,{handlerTimeout:100, telegram:{webhookReply:true}}) 
const ldb		= require('./ldb')
const level  	= require('level')
const lvUser	= level('./db/users')
const html		= fs.readFileSync('index.html','utf8').toString()
const secret	= crypto.randomBytes(16).toString('hex')	
const admins 	= [198698277]
const nobody 	= 'data:image/png;base64,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'
const mainKB	= {parse_mode:'HTML',reply_markup:{keyboard:[[{text:'New Game'},{text:'Leaderboard'}]],resize_keyboard:true}}

function toImage(board){
	const resvg = new Resvg(board, {background:'rgba(255,255,255,.9)'})
	const pngData = resvg.render()
	return pngData.asPng()
}
bot.use(async (ctx,next) => {
	if (ctx.from && ctx.chat && ctx.from.id!=ctx.chat.id) return
	if (ctx.from && ctx.from.id) {
		const user = await ldb.getRec(lvUser, 'tg'+ctx.from.id)
		if (!user){
			const upd = {...ctx.from, date:Math.ceil(Date.now()/1000)}
			delete upd.is_bot
			const photos = await bot.telegram.getUserProfilePhotos(ctx.from.id,0,1)
			upd.photo = photos?.photos?.length ? photos.photos[0][0]?.file_id : undefined
			await ldb.updRec(lvUser, 'tg'+ctx.from.id, upd)
			bot.telegram.sendMessage(admins[0],JSON.stringify(upd,0,2)
				.replace(/id"\: \d+/,'id": <a href="tg://user?id='+ctx.from.id+'">id'+ctx.from.id+'</a>')
				.replace(/date"\: \d+/,'date": '+new Date(upd.date*1000).toISOString().split('T')[0].split('-').reverse().join('.'))
				,{parse_mode:'HTML'})
		}	
		return next()
	}
})
bot.help( ctx => ctx.replyWithAnimation('https://telegra.ph/file/1b2fec0958aa4aa5f999c.gif',mainKB))
bot.start(ctx => ctx.replyWithAnimation('https://telegra.ph/file/1b2fec0958aa4aa5f999c.gif',mainKB))
bot.action(/color(\d)/, async ctx => {
	const data = ctx.callbackQuery.message.caption_entities && ctx.callbackQuery.message.caption_entities[0]?.url?.substr(14) 
	if (!data) return ctx.answerCbQuery('Something went wrong')
	let player = 3 - +ctx.callbackQuery.message.caption_entities[0]?.url?.substr(13,1)
	const board = data.split('/').map(row => {
		let r = []
		for (let i=0; i < row.length; i=i+2) r.push(+row.substr(i,2))
		return r	
	})
	let next_board = filler.nextStep(board, player, +ctx.match[1])
	let t = Date.now()
	const best_color = filler.getStepColor(filler.clone(next_board), 3-player)
	t = Date.now()-t
	if (t>3500) console.log(t,'ms')
	if (best_color.color!=undefined){
		player = 3 - player
		next_board = filler.nextStep(next_board, player, best_color.color)
	}
	const scores = filler.calcScores(next_board)
	if (scores.winner!=undefined){
		scores.kb = []
		if (!scores.winner){
			try{
				const lb = await ldb.getRec(lvUser, 'leaderboard') || []
				const score = scores.scores[0]-scores.scores[1]
				const ptr = lb.findIndex(e => e.id == 'tg'+ctx.from.id)
				if (ptr<0) lb.push({id:'tg'+ctx.from.id, scores:score})
				else if (score > lb[ptr].scores) lb[ptr].scores=score
				lb.sort((a,b) => a.scores>b.scores?-1:1)
				await ldb.setRec(lvUser, 'leaderboard', lb.slice(0,10))
			}catch(err){
				console.log(err)
			}
		}
	}
	const svg    = filler.genSVG(next_board)
	const source = toImage(svg)
	const hex_board = player.toString()+next_board.map(row => row.map(e => ('0'+e).substr(-2)).join('')).join('/')
	try{
		await ctx.editMessageMedia({type:'photo', media:{source}}, {inline_keyboard:[scores.kb]}) 
		await ctx.editMessageCaption(scores.scores[0]+':'+scores.scores[1]+'<a href="https://t.me/'+hex_board+'">&#8203;</a>', {parse_mode:'HTML', reply_markup:{inline_keyboard:[scores.kb]}})
	}catch(err){
		return ctx.answerCbQuery('Something went wrong', mainKB)
	}
	return ctx.answerCbQuery()
})
bot.hears(/^Leaderboard$/i, async ctx => {
	let text = '<code>Top 10</code>\n\n'
	try{
		let lb = await ldb.getRec(lvUser, 'leaderboard') || []
		let k = 0
		for (let user of lb){
			const user_data = await ldb.getRec(lvUser, user.id)
			if (user_data){
				k++
				let name = ((user_data.first_name || '')+' '+(user_data.last_name || '')).trim()
				if (!name.length) name = user_data.username || 'Telegram user'
				text += '<code>'+(' '+k).substr(-2)+'.'+(name+'                          ').substr(0,24)+' '+('   +'+user.scores).substr(-4)+' '+(user.id.startsWith('fa')?'🔸':'🔹')+'</code>\n'
			}
		}
	}catch(err){
		console.log(err)
		return ctx.reply('Something went wrong', mainKB)
	}
	return  ctx.reply(text, {parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'Open in browser', url:process.env.DOMAIN}]]}})
})
bot.hears(/^New Game$/i, (ctx,next) => {
	ctx.message.text = 'new'
	return next()
})
bot.hears(/^\/?new$/i, async ctx => {
	const board  = filler.genBoard()
	const scores = filler.calcScores(board)
	const svg    = filler.genSVG(board)
	const source = toImage(svg)
	const hex_board = '2'+board.map(row => row.map(e => ('0'+e).substr(-2)).join('')).join('/')
	return ctx.replyWithPhoto({source},{caption:scores.scores[0]+':'+scores.scores[1]+'<a href="https://t.me/'+hex_board+'">&#8203;</a>', parse_mode:'HTML', reply_markup:{inline_keyboard:[scores.kb]}})
})
bot.on('message', ctx => ctx.reply('Unrecognized command', mainKB))
bot.catch(err => console.error(err))
bot.telegram.setWebhook(process.env.DOMAIN+'/'+secret)
bot.telegram.getMe().then(res => {
	process.env.BOT_NAME = process.env.BOT_NAME || (res && res.username);
	console.log(process.env.BOT_NAME)
})

async function getUserInfo(fid){
	const result = {}
	try{
		const res = await fetch('https://hub.pinata.cloud/v1/userDataByFid?fid='+fid+'&user_data_type=4', {timeout:5000})
		const data = await res.json()
		result.image   = data?.messages?.find(e => e.data?.userDataBody?.type == 'USER_DATA_TYPE_PFP')
		result.display = data?.messages?.find(e => e.data?.userDataBody?.type == 'USER_DATA_TYPE_DISPLAY')
		if (result.display) result.display 	= result.display.data.userDataBody.value
		if (result.image) 	result.image 	= result.image.data.userDataBody.value
	}catch(error){console.log(error)}
	return result
}
async function request(req, res){
	try{
		const query = req.query ? JSON.parse(JSON.stringify(req.query)) : null
		let html2 = html
		const tx 	 = req.body?.untrustedData?.transactionId
		const button = req.body?.untrustedData?.buttonIndex
		const isPost = req.method == 'POST'
		if (isPost && !button) throw new Error('No buttons in post')
		res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'})
		if (isPost && !tx){
			let next_board, scores
			const fid 	= req.body?.untrustedData?.fid
			const state = req.body?.untrustedData?.state
			if (state){
				const colors = state.substr(0,4).split('').map(e => +e)
				const board = state.substr(4).split('/').map(row => {
					let r = []
					for (let i=0; i < row.length; i=i+2) r.push(+row.substr(i,2))
					return r	
				})
				next_board = filler.nextStep(board, 1, +colors[button-1])
				let t = Date.now()
				const best_color = filler.getStepColor(filler.clone(next_board), 2, 0, Date.now(), 3500)
				t = Date.now()-t
				if (t>3500) console.log(t,'ms')
				if (best_color.color!=undefined) next_board = filler.nextStep(next_board, 2, best_color.color)

				scores = filler.calcScores(next_board)
				if (scores.winner!=undefined){
					scores.kb = []
					if (!scores.winner && fid){
						try{
							const user = await ldb.getRec(lvUser,'fa'+fid)
							if (!user){
								const data = await getUserInfo(fid)
								let first_name = data.display?.length?data.display:'Farcaster user'
								if (!data.error) await ldb.setRec(lvUser,'fa'+fid,{first_name, image:data.image})
							}
							const lb = await ldb.getRec(lvUser, 'leaderboard') || []
							const score = scores.scores[0]-scores.scores[1]
							const ptr = lb.findIndex(e => e.id == 'fa'+fid)
							if (ptr<0) lb.push({id:'fa'+fid, scores:score})
							else if (score > lb[ptr].scores) lb[ptr].scores=score
							lb.sort((a,b) => a.scores>b.scores?-1:1)
							await ldb.setRec(lvUser, 'leaderboard', lb.slice(0,10))
						}catch(err){
							console.log(err)
						}
					}
				}
			} else {
				if (button>1){
					let buttons = '<meta property="fc:frame:post_url" content="'+process.env.DOMAIN+'/tx_callback"/><meta name="fc:frame:button:1" content="Play"><meta name="fc:frame:button:1:action" content="post">'
					buttons += [1,5,10].map((b,i) => '<meta property="fc:frame:button:'+(i+2)+'" content="'+b+' USDC"/><meta name="fc:frame:button:'+(i+2)+':action" content="tx"><meta name="fc:frame:button:'+(i+2)+':target" content="'+process.env.DOMAIN+'/get_tx_data?value='+b+'">')
					return res.end(html2.replace(/%image%/g, 'https://telegra.ph/file/26a6fab941c4c221a7ceb.gif').replace(/\<buttons\>.*\<\/buttons\>/sm, buttons))
				}
				next_board  = filler.genBoard()
				scores = filler.calcScores(next_board)
			}
			const hex_board = scores.winner!=undefined?'':(scores.kb.map(b => b.callback_data.substr(-1))).join('')+next_board.map(row => row.map(e => ('0'+e).substr(-2)).join('')).join('/')
			const source = toImage(filler.genSVG(next_board))
			let buttons = '<meta property="fc:frame:input:text" content="'+scores.scores[0]+':'+scores.scores[1]+'"/>'
			if (scores.kb.length) buttons += '<meta property="fc:frame:state" content="'+hex_board+'"/>'
			buttons += scores.kb.map((b,i) => '<meta property="fc:frame:button:'+(i+1)+'" content="'+b.text+'"/>')
			html2 = scores.kb.length ? html2.replace(/\<buttons\>.*\<\/buttons\>/sm, buttons) : html2.replace('<buttons>', buttons).replace('</buttons>','')
			return res.end(html2.replace(/%image%/g, 'data:image/png;base64,'+source.toString('base64')))
		} else {
			let body = ''
			try{
				let lb = await ldb.getRec(lvUser, 'leaderboard') || []
				for (let user of lb){
					const user_data = await ldb.getRec(lvUser, user.id)
					if (user_data){
						let name = ((user_data.first_name || '')+' '+(user_data.last_name || '')).trim()
						if (!name.length) name = user_data.username || 'Telegram user'
						if (user_data.photo){
							try{
								user_data.image = await bot.telegram.getFileLink(user_data.photo)
							}catch(err){}	
						}
						body += '<div style="display:table-row;"><img class="img" style="border:3px solid #'+(user.id.startsWith('fa')?'815AC6':'2394CE')+';" src="'+(user_data.image || nobody)+'" title="'+(user.id.startsWith('fa')?'farcaster':'telegram')+'"/><div class="text" style="width:100%;">'+name+'</a></div><div class="text" style="text-align:end;">+'+user.scores+'</div></div>'
					}
				}
			}catch(err){
				console.log(err)
			}
			return res.end(html2.replace(/%image%/g,'https://telegra.ph/file/'+(tx?'190fa55035bf8de375b0d.jpg':'1b2fec0958aa4aa5f999c.gif')).replace('%body%',body))
		}
		throw new Error('No variants')
	}catch(err){
		console.log(err)
		res.writeHead(400)
		res.end('Something went wrong')
	}	
}
async function get_tx_data(req, res){
	const abi 	   = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationUsed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"Blacklisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newBlacklister","type":"address"}],"name":"BlacklisterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newMasterMinter","type":"address"}],"name":"MasterMinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"MinterConfigured","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldMinter","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"UnBlacklisted","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"CANCEL_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RECEIVE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRANSFER_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"authorizationState","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"blacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"blacklister","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"cancelAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"cancelAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"},{"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"configureMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currency","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"tokenName","type":"string"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"string","name":"tokenCurrency","type":"string"},{"internalType":"uint8","name":"tokenDecimals","type":"uint8"},{"internalType":"address","name":"newMasterMinter","type":"address"},{"internalType":"address","name":"newPauser","type":"address"},{"internalType":"address","name":"newBlacklister","type":"address"},{"internalType":"address","name":"newOwner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newName","type":"string"}],"name":"initializeV2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"lostAndFound","type":"address"}],"name":"initializeV2_1","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"accountsToBlacklist","type":"address[]"},{"internalType":"string","name":"newSymbol","type":"string"}],"name":"initializeV2_2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"isBlacklisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"masterMinter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"minterAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"receiveWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"receiveWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"removeMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenContract","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"transferWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"transferWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"unBlacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newBlacklister","type":"address"}],"name":"updateBlacklister","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMasterMinter","type":"address"}],"name":"updateMasterMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newPauser","type":"address"}],"name":"updatePauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"updateRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"}]
	const contract = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
	res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'Access-Control-Allow-Origin':'*'})
	try{
		const query = req.query ? JSON.parse(JSON.stringify(req.query)) : null
		const result = {
		  chainId: "eip155:8453",
		  method: "eth_sendTransaction",
		  params: {
			to: contract,
			data: encodeFunctionData({
				abi,
				functionName: 'transfer',
				args: ['0x0581213e9E6ABb9e56612e9D208006162F385ad6', BigInt(query.value+'000000')],   //000000000000000000
			}),
		  },
   		  value: parseGwei('10000').toString()
		}
		res.end(JSON.stringify(result))
	}catch(err){
		console.log(err)
		res.end('{"message":"Something went wrong"}')
	}
}
const server = polka()
server.use(bot.webhookCallback('/'+secret),bParser.json())  
server.get('/',  request)
server.post('/', request)
server.post('/tx_callback', request)
server.post('/get_tx_data', get_tx_data)
server.listen(5000, err => console.log(err?err:'filler server running...'))
