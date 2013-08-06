
var iBottom = document.getElementById( 'bottom-img' );
var iTop = document.getElementById( 'top-img' );
var can = document.getElementById( 'canvas' );
var iTopData;
var ctx;

init();
animate();

function init() {
  (function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
  })();

  setupSize();

  ctx = can.getContext( '2d' );

  iTop.src += '?' + Date.now();
  iTop.onload = function() {
    iTopData = getImageData( iTop, ctx.canvas.width, ctx.canvas.height );
    iTop.style.display = 'none';
  };

  setupControls();
}

function setupControls() {
  can.addEventListener( 'mousedown', onMouseDown );
  document.addEventListener( 'touchstart', onTouchStart );

  can.addEventListener( 'mouseup', onMouseUp );
  document.addEventListener( 'touchend', onTouchEnd );

  can.addEventListener( 'dblclick', onDoubleClick );
}

function onMouseDown( ev ) {
  ev.preventDefault();
  can.addEventListener( 'mousemove', onMouseMove );

}

function onTouchStart( ev ) {

  if ( ev.touches.length === 1 ) {
    document.addEventListener( 'touchmove', onTouchMove );
  }
}

function onMouseUp( ev ) {
  ev.preventDefault();
  can.removeEventListener( 'mousemove', onMouseMove );
  document.removeEventListener( 'touchmove', onMouseMove );
}


function onTouchEnd( ev ) {
  return onMouseUp( ev );
}

function onDoubleClick( ev ) {
  ev.preventDefault();
  if ( iTopData ) {
    setAlpha( iTopData, 255 );
  }
}

function onTouchMove( ev ) {
  ev.preventDefault();

  if ( ev.touches.length === 1 ) {
    ev.clientX = ev.touches[0].clientX;
    ev.clientY = ev.touches[0].clientY;
    return onMouseMove( ev );
  }
}

// A naive implementation:
function onMouseMove( ev ) {
  // console.log( ev.clientX );
  ev.preventDefault();
  if ( iTopData ) {
    setAlphaWhere(
      iTopData,

      function( cx, cy ) {
        return function( x, y ) {
          var dx = x - cx, dy = y -cy;
          return dx*dx + dy*dy < 400;
        }
      }( ev.clientX, ev.clientY ),

      0
      // makeBlendFn1( ev.clientX, ev.clientY )
    );
  }
  return false;
}

function makeBlendFn1( cx, cy ) {
  return function( x, y ) {
    var dx = x - cx, dy = y - cy, rsq = dx*dx + dy*dy;
    return rsq / 100 * 255;
  }
}

function setPixelAlpha( imgData, x, y, value ) {
  var data = imgData.data, ind = getPixelIndex( imgData, x, y, 'a' );
  data[ ind ] = value;
}

function setAlphaWhere( imgData, filter, valueFn ) {
  var data = imgData.data, w = imgData.width, h = imgData.height;
  var i, j, value;
  for ( i = 0; i < w; ++i ) {
    for ( j = 0; j < h; ++j ) {
      if ( filter( i, j ) === true ) {
        if ( typeof valueFn === 'function' ) {
          value = valueFn( i, j );
        } else {
          value = valueFn;
        }
        setPixelAlpha( imgData, i, j, value );
      }
    }
  }
}

function setAlpha( imgData, value ) {
  setAlphaWhere( imgData, function() { return true; }, value );
}

function halfAbove( x, y ) {
  return y < ctx.canvas.height/2;
}

function getPixelIndex( imgData, x, y, channel ) {
  var w = imgData.width, i;
  switch( channel ) {
  case 'r':
    i = 0;
    break;
  case 'g':
    i = 1;
    break;
  case 'b':
    i = 0;
    break;
  case 'a':
    i = 3;
    break;
  default:
    i = 0;
  }
  return ( x + y*w )*4 + i;
}

function  setupSize() {
  [ iBottom, iTop, can ].map( function( el ) {
    el.height = window.innerHeight;
  } );
  can.width = iBottom.width;
}


function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  if ( iTopData ) {
    ctx.putImageData( iTopData, 0, 0 );
  }
}

function getImageData( img, w, h ) {
  var ctx = document.createElement( 'canvas' ).getContext( '2d' );
  w && ( ctx.canvas.width = w );
  h && ( ctx.canvas.height = h );
  ctx.drawImage( img, 0, 0, ctx.canvas.width, ctx.canvas.height );
  return ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height );
}
