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

	var reading= stream.map(fn)
	function loop(){
		return reading
			.chain(most.fromPromise)
			.recoverWith( err=> {
				console.log("RECOVER", err)
				if( _catchAdd){
					_catchAdd( err)
				}
				return loop()
			})
	}
	var $then= loop()
	//$then.drain().then(function(){
	//	if( _catchEnd){
	//		_catchEnd()
	//	}else{
	//		_catchEnd= true
	//	}
	//})
	return {
		$then,
		$catch
	}
}

if( require.main=== module){
	process.on("unhandledRejection", console.error)
	//var res= mostMap( most.from([42, -1, 43, -2, 44, -3, -4, 55, 60, -5]), function( n){
	var res= mostMap(  function( n){
		if( n< 0){
			return Promise.reject(n)
		}
		return Promise.resolve(n)
	}, most.from([42, -1, 55]))
	res.$catch.forEach( n=> console.log(n, "catch")).then( _=> console.log("done catch"))
	res.$then.forEach( n=> console.log(n, "then")).then( _=> console.log("done then"))
}
