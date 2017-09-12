"use strict"

var most= require( "most")
var create= require( "@most/create").create

function noop(){}

function mostMap( fn, stream){
	var _resolvedAdd= noop, _resolvedEnd
	var resolved= create(function(add, end){
		if( _resolvedEnd){
			end()
			return
		}
		_resolvedAdd= add
		_resolvedEnd= end
	})

	var _rejectedAdd= noop, _rejectedEnd
	var rejected= create(function(add, end){
		console.log("create rejected")
		if( _rejectedEnd){
			console.log("end")
			end()
			return
		}
		_rejectedAdd= add
		_rejectedEnd= end
	})

	stream
	.map(function(x){
		return Promise
			.resolve( x)
			.then(function(x){
				return fn( x)
			})
			.then( _resolvedAdd)
			.catch( function(err){
				_rejectedAdd(err)
			})
	})
	.awaitPromises()
	.drain()
	.then(function(){
		if( _rejectedEnd){
			_rejectedEnd()
		}else{
			_rejectedEnd= true
		}
		if( _resolvedEnd){
			_resolvedEnd()
		}else{
			_resolvedEnd= true
		}
	})

	return {
		resolved,
		rejected
	}
}

if( require.main=== module){
	process.on("unhandledRejection", console.error)
	var stream= most.from([42, -1, 43, -2, 44, -3, -4, 55, 60, -5])
	var res= mostMap( function( n){
		if( n< 0){
			return Promise.reject(n)
		}
		return Promise.resolve(n)
	}, stream)
	res.resolved.forEach( n=> console.log(n.toString(), "resolved")).then( _=> console.log("done resolved"))
	res.rejected.forEach( n=> console.log(n.toString(), "rejected")).then( _=> console.log("done rejected"))
}
