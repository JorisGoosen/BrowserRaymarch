var canvas=null;
	var gl;
	var VOLSHADER;
	var VIEWPORT_VERTEX;
	var VIEWPORT_FACES;
	var _position;
    var _uv;
	
	
	document.addEventListener("fullscreenchange", fsswitch);
	document.addEventListener("webkitfullscreenchange", fsswitch);
	document.addEventListener("mozfullscreenchange", fsswitch);
	document.addEventListener("MSFullscreenChange", fsswitch);

	window.onload = init;
	
	function init() {
	
		canvas = document.getElementById("kleurtjes");
		console.log(canvas);
		gl= WebGLUtils.setupWebGL(canvas,{ antialias: false, depth: false, alpha: true });
		console.log(gl);
		
		if(!gl) {alert("WebGL does not work!");}
		
		gl.viewport(0,0,canvas.width,canvas.height);
		gl.clearColor(0.1,0.1,0.1,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		VOLSHADER=gl.createProgram();
		var vertshadesourceobj=document.getElementById("kleur-vert");
		var fragshadesourceobj=document.getElementById("kleur-frag");
		var vertshader=gl.createShader(gl.VERTEX_SHADER);
		var fragshader=gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(vertshader, raymarchvert);
		gl.shaderSource(fragshader, raymarchfrag);
		gl.compileShader(vertshader);
		gl.compileShader(fragshader);
				
		gl.attachShader(VOLSHADER, vertshader);
		gl.attachShader(VOLSHADER, fragshader);
		gl.linkProgram(VOLSHADER);

		var compiled 		= gl.getShaderParameter(vertshader, gl.COMPILE_STATUS);
		var compilationLog 	= gl.getShaderInfoLog(vertshader);
		
		console.log('Vert Shader compiled successfully: ' 	+ compiled);
		console.log('Vert Shader compiler log: ' 			+ compilationLog);

		compiled 		= gl.getShaderParameter(fragshader, gl.COMPILE_STATUS);
		compilationLog 	= gl.getShaderInfoLog(fragshader);
		
		console.log('Frag Shader compiled successfully: ' 	+ compiled);
		console.log('Frag Shader compiler log: ' 			+ compilationLog);
		
		_position   = gl.getAttribLocation(VOLSHADER, "position");
        _uv         = gl.getAttribLocation(VOLSHADER, "uv");

		
		gl.enableVertexAttribArray(_position);
        gl.enableVertexAttribArray(_uv);

		
		
		
		
		var viewport_vertex=[
		-1, 1, 0, -1,  1,
		-1,-1, 0, -1, -1,
		 1,-1, 0,  1, -1,
		 1, 1, 0,  1,  1];

		VIEWPORT_VERTEX= gl.createBuffer ();
		gl.bindBuffer(gl.ARRAY_BUFFER, VIEWPORT_VERTEX);
		gl.bufferData(gl.ARRAY_BUFFER,    new
		Float32Array(viewport_vertex), gl.STATIC_DRAW);
		
		var viewport_faces = [
		0,1,2,
		0,2,3];


		VIEWPORT_FACES= gl.createBuffer ();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIEWPORT_FACES);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new
		Uint16Array(viewport_faces), gl.STATIC_DRAW);
		
		renderFrame(0.0);

	}
	
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
	
	function fsswitch()
	{
		justswitched=true;
		renderFrame();
	}

	function clicked()
	{
		fsswitch();
	}
	
	function renderFrame(time)
	{
		var fullscreenEnabled = false;
		
		if (
		    document.fullscreenElement ||
		    document.webkitFullscreenElement ||
		    document.mozFullScreenElement ||
		    document.msFullscreenElement
		)  fullscreenEnabled=true;

		
		if(!fullscreenEnabled)
		{
			canvas.width  = 512;
  			canvas.height = 512;
  			document.getElementById("kleurtjes").removeAttribute('style');

		}else{
			canvas.width  = window.innerWidth;
  			canvas.height = window.innerHeight;
  			document.getElementById("kleurtjes").style.top=0;
  			document.getElementById("kleurtjes").style.left=0;
		}
		
		gl.viewport(0,0,canvas.width,canvas.height);
		gl.clearColor(0.0,0.0,0.0,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		gl.useProgram(VOLSHADER);
		
		gl.uniform1f(gl.getUniformLocation(VOLSHADER,"time"),			time);
		gl.uniform1f(gl.getUniformLocation(VOLSHADER,"fov_y_scale"),	1.5);
		gl.uniform1f(gl.getUniformLocation(VOLSHADER,"aspect"),			canvas.width/canvas.height);		
				
		gl.bindBuffer(gl.ARRAY_BUFFER, VIEWPORT_VERTEX);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIEWPORT_FACES);

		gl.vertexAttribPointer(_position,   3, gl.FLOAT, false, 4*(3+2), 0) ;
        gl.vertexAttribPointer(_uv,         2, gl.FLOAT, false, 4*(3+2), 3 * 4) ;


		gl.drawElements(gl.TRIANGLES, 2*3, gl.UNSIGNED_SHORT, 0);
		
		gl.flush();

		window.requestAnimFrame(renderFrame);
	}
	
	
	
	function fullScreen(element) {
	
	if(element.requestFullscreen) {

		element.requestFullscreen();

	} else if(element.webkitRequestFullscreen ) {

		element.webkitRequestFullscreen();

	} else if(element.mozRequestFullScreen) {

		element.mozRequestFullScreen();

	}

	}