var Effect = function(NAME){
	this.shaders;
	this.blendId;
	this.name = NAME;
	this.init = function(){
		switch(this.name){
			case "warp":
				this.shaders = this.warpEffect();
				this.useMask = true;
				break;
		}
	}
	this.warpEffect = function(){
		var customShaders = new CustomShaders();
		var shaders = [
	       	customShaders.passShader,
	        customShaders.diffShader2, 
	        customShaders.passShader,
	        customShaders.warp2
		]
		return shaders;
	}
}