
var iBottom = document.getElementById( 'bottom-img' );
var iTop = document.getElementById( 'top-img' );
var can = document.getElementById( 'canvas' );
var iTopData;
var ctx;

init();
animate();

function init() {
  setupSize();
  iTop.style.display = 'none';

  ctx = can.getContext( '2d' );

  iTop.onload = function() {
    iTopData = getImageData( iTop, ctx.canvas.width, ctx.canvas.height );
  };

  setupControls();
}

function setupControls() {
  can.addEventListener( 'mousedown', onMouseDown );
  can.addEventListener( 'touchstart', onTouchStart );

  can.addEventListener( 'mouseup', onMouseUp );
  can.addEventListener( 'touchend', onTouchEnd );

  can.addEventListener( 'dblclick', onDoubleClick );
}

function onMouseDown( ev ) {
  ev.preventDefault();
  can.addEventListener( 'mousemove', onMouseMove );
}

function onTouchStart( ev ) {
  if ( ev.touches === 1 ) {
    return onMouseDown( ev );
  }
}

function onMouseUp( ev ) {
  ev.preventDefault();
  can.removeEventListener( 'mousemove', onMouseMove );
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

// A naive implementation:
function onMouseMove( ev ) {
  // console.log( ev.clientX );
  ev.preventDefault();
  if ( iTopData ) {
    setAlphaWhere( iTopData, function( cx, cy ) {
      return function( x, y ) {
        var dx = x - cx, dy = y -cy;
        return dx*dx + dy*dy < 100;
      }
    }( ev.clientX, ev.clientY ), 0 );
  }
}

function setPixelAlpha( imgData, x, y, value ) {
  var data = imgData.data, ind = getPixelIndex( imgData, x, y, 'a' );
  data[ ind ] = value;
}

function setAlphaWhere( imgData, filter, value ) {
  var data = imgData.data, w = imgData.width, h = imgData.height;
  var i, j;
  for ( i = 0; i < w; ++i ) {
    for ( j = 0; j < h; ++j ) {
      if ( filter( i, j ) === true ) {
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
