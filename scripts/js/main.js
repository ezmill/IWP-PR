var container;
var scene, camera, light, renderer;
// var renderSize = new THREE.Vector2(window.innerWidth, 2500*(window.innerWidth/3750));
var renderSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
// if(window.innerWidth>3750*(window.innerHeight/2500)){
    // renderSize = new THREE.Vector2(window.innerWidth, 2500*(window.innerWidth/3750));
// } else {
    // renderSize = new THREE.Vector2(3750*(window.innerHeight/2500), window.innerHeight);
// }       
// var renderSize = new THREE.Vector2(window.innerWidth*0.25, 2500*(window.innerWidth*0.25/3750));
// var renderSize = new THREE.Vector2(3750, 2500);
var mouse = new THREE.Vector2(0.0,0.0);
var mouseDown = false;
var r2 = 0.0;
var time = 0.0;
var mask;
var origTex;
var effect;
// var effects = [
// 	"oil paint",
// 	"edge detect",
// 	"revert",
// 	"rgb shift",
// 	"warp"
// ], effectIndex = 0;
var texture;
var fbMaterial;
var origTex = THREE.ImageUtils.loadTexture("assets/textures/test.jpg");
origTex.minFilter = origTex.magFilter = THREE.LinearFilter;
var nextEffectsSelector = document.getElementById("nextEffectsSelector");
var currentEffectsSelector = document.getElementById("effectsSelector");
init();
function init(){
	scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera( renderSize.x / - 2, renderSize.x / 2, renderSize.y / 2, renderSize.y / - 2, -10000, 10000 );
    camera.position.set(0,0,0);

	renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
	renderer.setSize( renderSize.x, renderSize.y );
	renderer.setClearColor(0xffffff,1.0);

	container = document.getElementById( 'container' );
	container.appendChild(renderer.domElement);

	createEffect();

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mousedown", onMouseDown);
	document.addEventListener("mouseup", onMouseUp);
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	document.addEventListener( 'touchend', onDocumentTouchEnd, false );
	document.addEventListener( 'touchcancel', onDocumentTouchEnd, false );
	document.addEventListener( 'touchleave', onDocumentTouchEnd, false );
	window.addEventListener("resize", onWindowResize);
	// document.addEventListener("keydown", onKeyDown);
	console.log("W: " + renderSize.x + ", H: " +  renderSize.y);
	animate();

}
function createEffect(){


	if(texture)texture.dispose();
	texture = THREE.ImageUtils.loadTexture("assets/textures/test.jpg");
	texture.minFilter = texture.magFilter = THREE.LinearFilter;

    effect = new Effect("warp");
    effect.init();
    if(effect.useMask){
		mask = new Mask();
		mask.init();
		alpha = new THREE.Texture(mask.canvas);
		alpha.minFilter = alpha.magFilter = THREE.LinearFilter;
		alpha.needsUpdate = true;
    } else {
		alpha = null;
    }
    if(fbMaterial)fbMaterial.dispose();
	fbMaterial = new FeedbackMaterial(renderer, scene, camera, texture, effect.shaders);  
    fbMaterial.init();
    // fbMaterial.scale(0.33333);
    for(var i = 0; i < fbMaterial.fbos.length; i++){
		if(fbMaterial.fbos[i].material.uniforms["id"])fbMaterial.fbos[i].material.uniforms["id"].value = effect.blendId;
	    	if(fbMaterial.fbos[i].material.uniforms["origTex"])fbMaterial.fbos[i].material.uniforms["origTex"].value = origTex;
		// if(fbMaterial.fbos[i].material.uniforms["origTex"])fbMaterial.fbos[i].material.uniforms["origTex"].value = origTex;
    	// if(fbMaterial.fbos[i].material.uniforms["id2"])fbMaterial.fbos[i].material.uniforms["id2"].value = effect.id2;
    }

    
}	
function animate(){
	window.requestAnimationFrame(animate);
	draw();
}

function onMouseMove(event){
	mouseDown = true;
	if(effect.useMask){
		mask.mouse = new THREE.Vector2(event.pageX, event.pageY);		
	}
	mouse.x = ( event.pageX / renderSize.x ) * 2 - 1;
    mouse.y = - ( event.pageY / renderSize.y ) * 2 + 1;
}
function onMouseDown(){
	mouseDown = true;
}
function onMouseUp(){
	mouseDown = true;
	r2 = 0;
}
function onDocumentTouchStart( event ) {
	mouseDown = true;
    updateMouse(event);
}

function onDocumentTouchMove( event ) {
	mouseDown = true;
    updateMouse(event);
}

function updateMouse(event){
    if ( event.touches.length === 1 ) {
        event.preventDefault();
        if(effect.useMask){
			mask.mouse = new THREE.Vector2(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);		
		}
		mouse.x = ( event.touches[ 0 ].pageX / renderSize.x ) * 2 - 1;
	    mouse.y = - ( event.touches[ 0 ].pageY / renderSize.y ) * 2 + 1;
    }
}
    
function onDocumentTouchEnd( event ) {
	mouseDown = false;
	r2 = 0;
}
function onWindowResize( event ) {
	// if(window.innerWidth>3750*(window.innerHeight/2500)){
	    // renderSize = new THREE.Vector2(window.innerWidth, 2500*(window.innerWidth/3750));
	// } else {
	    // renderSize = new THREE.Vector2(3750*(window.innerHeight/2500), window.innerHeight);
	// }      
	renderSize = new THREE.Vector2(window.innerWidth, window.innerHeight); 
	renderer.setSize( renderSize.x, renderSize.y );
    camera.left = renderSize.x / - 2;
    camera.right = renderSize.x / 2;
    camera.top = renderSize.y / 2;
    camera.bottom = renderSize.y / - 2;
    mask.resize();
	fbMaterial.setUniforms();
	fbMaterial.resize();
	console.log("W: " + renderSize.x + ", H: " +  renderSize.y);

	// renderer.render(scene, camera);
	// fbMaterial.getNewFrame();
	// fbMaterial.swapBuffers();

}
function draw(){
	time += 0.01;
	if(mouseDown){
		r2 = 0.5;
	}

	if(effect.useMask){
		mask.update();
		alpha.needsUpdate = true;
	}
	fbMaterial.setUniforms();
    fbMaterial.update();
	renderer.render(scene, camera);
	fbMaterial.getNewFrame();
	fbMaterial.swapBuffers();
}
function dataURItoBlob(dataURI) {
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {
        type: mimeString
    });
}