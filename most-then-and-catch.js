"use strict"

var most= require( "most")
var create= require( "@most/create").create

function mostMap( fn, stream){
	var _catchAdd, _catchEnd
	var $catch= create(function(add, end){
		if( _catchEnd){
			end()
			return
		}
		_catchAdd= add
		_catchEnd= end
	})

	var _thenAdd, _thenEnd
	var $then= create(function(add, end){
		if( _thenEnd){
			end()
			return
		}
		_thenAdd= add
		_thenEnd= end
	})

	stream.forEach(function(x){
		Promise
			.resolve( fn( x))
			.then(function( y){
				_thenAdd( y)
			})
			.catch(function( err){
				_catchAdd( err)
			})
	}).then(function(){
		if( _catchEnd){
			_catchEnd()
		}else{
			_catchEnd= true
		}
		if( _thenEnd){
			_thenEnd()
		}else{
			_thenEnd= true
		}
	})

	return {
		$then,
		$catch
	}
}

if( require.main=== module){
	process.on("unhandledRejection", console.error)
	var stream= most.from([42, -1, 43, -2, 44, -3, -4, 55, 60, -5])
	var res= mostMap(  function( n){
		if( n< 0){
			return Promise.reject(n)
		}
		return Promise.resolve(n)
	}, stream)
	res.$catch.forEach( n=> console.log(n, "catch")).then( _=> console.log("done catch"))
	res.$then.forEach( n=> console.log(n, "then")).then( _=> console.log("done then"))
}
