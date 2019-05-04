const glsl = x => x;

const raymarchvert = glsl`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif


attribute vec3 position;
attribute vec2 uv;

uniform float fov_y_scale;
uniform float aspect;
uniform float time;
uniform float zoom;

varying vec3 startpoint;
varying vec3 curraydir;



mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

void main(void)
{ 
	mat3 rotas = mat3(rotationMatrix(normalize(vec3(1.0, 0.0, 0.0)), (time * 0.0001236) * -1.0)); 
	mat3 rot = mat3(rotationMatrix(rotas * vec3(0.0, 1.0, 0.0), (time * 0.000166) * -1.0));

    startpoint=	-rot * vec3( 0.0, 0.0, -30.0 * zoom);
	curraydir = rot * normalize(vec3(uv.x * fov_y_scale * aspect, uv.y * fov_y_scale, -1.0));

	gl_Position = vec4(position, 1.);
}
`