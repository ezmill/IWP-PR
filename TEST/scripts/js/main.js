var container;
var scene, camera, light, renderer;
if(window.innerWidth>1440*(window.innerHeight/2560)){
	var renderSize = new THREE.Vector2(window.innerWidth, 1440*(window.innerWidth/2560));
} else {
	var renderSize = new THREE.Vector2(2560*(window.innerHeight/1440), window.innerHeight);
}		
var seed;
var mouse = new THREE.Vector2(0.0,0.0);
var mouseDown = false;
var r2 = 0.0;
var time = 0.0;
var mask;
var origTex;
var effect;
var liveMode = true;
var effects = [ "warp",
				"revert",
				"rgb shift",
				"oil paint",
				"repos",
				"flow",
				"gradient",
				"warp flow",
				"curves",
				"neon glow"
			]
var effectIndex = 0;
shuffle(effects);
insertRevert(effects);

var texture;
var fbMaterial;
var origTex = THREE.ImageUtils.loadTexture("assets/textures/newtest.jpg");
origTex.minFilter = origTex.magFilter = THREE.LinearFilter;
// origTex.wrapS = origTex.wrapT = THREE.RepeatWrapping;
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
	document.addEventListener("keydown", onKeyDown);
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	document.addEventListener( 'touchend', onDocumentTouchEnd, false );
	document.addEventListener( 'touchcancel', onDocumentTouchEnd, false );
	document.addEventListener( 'touchleave', onDocumentTouchEnd, false );
	window.addEventListener( 'resize', onWindowResize, false );
	animate();

}
function createEffect(){

	noise = THREE.ImageUtils.loadTexture("assets/textures/noise.png");
	noise.minFilter = noise.magFilter = THREE.LinearFilter;

	if(texture)texture.dispose();
	texture = THREE.ImageUtils.loadTexture("assets/textures/newtest.jpg");
	texture.minFilter = texture.magFilter = THREE.LinearFilter;
	// texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    effect = new Effect("warp");
    // effect = new Effect(effects[effectIndex]);
    effect.init();
    if(effect.useMask){
		mask = new Mask();
		mask.init();
		mask.update();
		alpha = new THREE.Texture(mask.renderer.domElement);
		alpha.minFilter = alpha.magFilter = THREE.LinearFilter;
		alpha.needsUpdate = true;
    } else {
		alpha = null;
    }
    if(fbMaterial)fbMaterial.dispose();
	fbMaterial = new FeedbackMaterial(renderer, scene, camera, texture, effect.shaders);  
    fbMaterial.init();
    if(effect.name == "neon glow"){
    	var tex = THREE.ImageUtils.loadTexture("assets/textures/NeonGlowMask.jpg");
    	tex.minFilter = tex.magFilter = THREE.LinearFilter;
		fbMaterial.setMask(tex);
    } else if(effect.name == "rgb shift" || effect.name == "oil paint" || effect.name == "flow" || effect.name == "warp flow" || effect.name == "repos"){
        var tex = THREE.ImageUtils.loadTexture("assets/textures/mask2.jpg")
    	tex.minFilter = tex.magFilter = THREE.LinearFilter;
		fbMaterial.setMask(tex);
    } else if(effect.name == "warp"){
    	var tex = THREE.ImageUtils.loadTexture("assets/textures/mask3.jpg");
    	tex.minFilter = tex.magFilter = THREE.LinearFilter;
		fbMaterial.setMask(tex);
    }

    // fbMaterial.scale(0.33333);
    for(var i = 0; i < fbMaterial.fbos.length; i++){
		if(fbMaterial.fbos[i].material.uniforms["id"])fbMaterial.fbos[i].material.uniforms["id"].value = effect.blendId;
	    	if(fbMaterial.fbos[i].material.uniforms["origTex"])fbMaterial.fbos[i].material.uniforms["origTex"].value = origTex;
		// if(fbMaterial.fbos[i].material.uniforms["origTex"])fbMaterial.fbos[i].material.uniforms["origTex"].value = origTex;
    	// if(fbMaterial.fbos[i].material.uniforms["id2"])fbMaterial.fbos[i].material.uniforms["id2"].value = effect.id2;
    }

    
}	
function createNewEffect(YN){

	if(effectIndex == effects.length - 1){
		effectIndex = 0;
	} else {
		effectIndex++;
	}		

    var blob = dataURItoBlob(renderer.domElement.toDataURL('image/jpg'));
    var file = window.URL.createObjectURL(blob);
    var img = new Image();
    img.src = file;
    img.onload = function(e) {
    	texture.dispose();
		texture.image = img;    		
	    effect = new Effect(effects[effectIndex]);
	    effect.init();
		if(effect.useMask){
			mask = new Mask();
			mask.init();
			mask.update();
			alpha = new THREE.Texture(mask.renderer.domElement);
			alpha.minFilter = alpha.magFilter = THREE.LinearFilter;
			alpha.needsUpdate = true;
		} else {
			alpha = null;
		}
		fbMaterial.dispose();
		fbMaterial = new FeedbackMaterial(renderer, scene, camera, texture, effect.shaders);			
	    fbMaterial.init();
        if(effect.name == "neon glow"){
        	var tex = THREE.ImageUtils.loadTexture("assets/textures/NeonGlowMask.jpg");
        	tex.minFilter = tex.magFilter = THREE.LinearFilter;
    		fbMaterial.setMask(tex);
        } else if(effect.name == "rgb shift" || effect.name == "oil paint" || effect.name == "flow" || effect.name == "warp flow" || effect.name == "repos"){
	        var tex = THREE.ImageUtils.loadTexture("assets/textures/mask2.jpg")
        	tex.minFilter = tex.magFilter = THREE.LinearFilter;
    		fbMaterial.setMask(tex);
        } else if(effect.name == "warp"){
        	var tex = THREE.ImageUtils.loadTexture("assets/textures/mask3.jpg");
        	tex.minFilter = tex.magFilter = THREE.LinearFilter;
    		fbMaterial.setMask(tex);
        }
	    for(var i = 0; i < fbMaterial.fbos.length; i++){
	    	if(fbMaterial.fbos[i].material.uniforms["id"])fbMaterial.fbos[i].material.uniforms["id"].value = effect.blendId;
	    	if(fbMaterial.fbos[i].material.uniforms["origTex"])fbMaterial.fbos[i].material.uniforms["origTex"].value = origTex;

	    	// if(fbMaterial.fbos[i].material.uniforms["id2"])fbMaterial.fbos[i].material.uniforms["id2"].value = Math.floor(Math.random()*25);
	    }
    }
}
function animate(){
	window.requestAnimationFrame(animate);
	draw();
}

function onMouseMove(event){
	mouseDown = true;
	mouse.x = ( event.pageX / renderSize.x ) * 2 - 1;
    mouse.y = - ( event.pageY / renderSize.y ) * 2 + 1;
    // if(effect.useMask){
    	// mask.mouse = new THREE.Vector2(event.pageX, event.pageY);		
	mask.mouse = new THREE.Vector2(mouse.x, mouse.y);		
    // }
}
function onMouseDown(){
	mouseDown = true;
	for(var i = 0; i < fbMaterial.fbos.length; i++){
		// if(fbMaterial.fbos[i].material.uniforms["id"])fbMaterial.fbos[i].material.uniforms["id"].value = Math.floor(Math.random()*25);
		// if(fbMaterial.fbos[i].material.uniforms["id2"])fbMaterial.fbos[i].material.uniforms["id2"].value = Math.floor(Math.random()*25);
	}
}
function onMouseUp(){
	mouseDown = true;
	r2 = 0;
	// setTimeout(createNewEffect, 1000);
	// createNewEffect(false);
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
		mouse.x = ( event.touches[ 0 ].pageX / renderSize.x ) * 2 - 1;
	    mouse.y = - ( event.touches[ 0 ].pageY / renderSize.y ) * 2 + 1;
		mask.mouse = new THREE.Vector2(mouse.x, mouse.y);		

    }
}
    
function onDocumentTouchEnd( event ) {
	mouseDown = false;
	r2 = 0;
	// setTimeout(createNewEffect, 1000);
		// createNewEffect(false);
}
function onWindowResize(){
	if(window.innerWidth>2560*(window.innerHeight/1440)){
        renderSize = new THREE.Vector2(window.innerWidth, 1440*(window.innerWidth/2560));
    } else {
        renderSize = new THREE.Vector2(2560*(window.innerHeight/1440), window.innerHeight);
    }
	renderer.setSize( renderSize.x, renderSize.y );
	camera.left = renderSize.x / - 2;
	camera.right = renderSize.x / 2;
	camera.top = renderSize.y / 2;
	camera.bottom = renderSize.y / - 2;
	mask.resize();
	fbMaterial.setUniforms();
	fbMaterial.resize();
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
function onKeyDown(e){
	console.log(e);
	if(e.keyCode == '88'){
		// mask.switchColor();
		createNewEffect();
	}
	if(e.keyCode == '32'){
		e.preventDefault();
		// createNewEffect();
		// fbMaterial.scale(3.0);
		// renderSize = new THREE.Vector2(2560, 1440);
		// camera.left = renderSize.x / - 2;
		// camera.right = renderSize.x / 2;
		// camera.top = renderSize.y / 2;
		// camera.bottom = renderSize.y / - 2;
		// renderer.setSize( renderSize.x, renderSize.y );
		// fbMaterial.setUniforms();
		// fbMaterial.resize();
	    // fbMaterial.update();
	    // renderer.render(scene, camera);
	    // fbMaterial.getNewFrame();
	    // fbMaterial.swapBuffers();
		var blob = dataURItoBlob(renderer.domElement.toDataURL('image/jpg'));
	    var file = window.URL.createObjectURL(blob);
	    var img = new Image();
	    img.src = file;
        img.onload = function(e) {
            window.open(this.src);
        }
		// renderSize = new THREE.Vector2(window.innerWidth, 1440*(window.innerWidth/2560));
		// camera.left = renderSize.x / - 2;
		// camera.right = renderSize.x / 2;
		// camera.top = renderSize.y / 2;
		// camera.bottom = renderSize.y / - 2;
		// renderer.setSize( renderSize.x, renderSize.y );
		// fbMaterial.setUniforms();
		// fbMaterial.resize();
	    // fbMaterial.update();
	    // renderer.render(scene, camera);
	    // fbMaterial.getNewFrame();
	    // fbMaterial.swapBuffers();
	}
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
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
function insertRevert(array){
	var length = array.length;
	for(var i = 0; i < length; i++){
		if(array[i] == "revert"){
			array.splice(i, 1);
		}
	}
	for(var i = 0; i < length; i++){
		if(array[i] == "flow" || array[i] == "repos"){
			array.splice(i+1, 0, "revert");
		}
	}
}
