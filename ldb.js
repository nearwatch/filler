exports.getRec 	= async function (base,id,nojson) {
	let x
    try {
		x = await base.get(id)
        return nojson?x:JSON.parse(x)
    } catch(err){return (err.toString().substr(0,14) == 'NotFoundError:')?null:{err:x}}
}
exports.setRec 	= async function (base,id,data,nojson) {
    try {
        await base.put(id,nojson?data:JSON.stringify(data))
        return data
    } catch(err) {return {err:err}}
}
exports.updRec 	= async function (base,id,data) {
    let x = await exports.getRec(base,id)
    if (!x) x = {}
    if (x.err) return x
    try {
        Object.keys(data).forEach(key => {x[key] = data[key]})
        await base.put(id,JSON.stringify(x))
        return x
    } catch(err) {return {err:err}}
}
exports.delRec 	= async function (base,id,nojson) {
    let x = await exports.getRec(base,id,nojson)
    if (x) {
        try {
            await base.del(id)
        } catch(err) {return {err:err}}
    }
    return x
}
