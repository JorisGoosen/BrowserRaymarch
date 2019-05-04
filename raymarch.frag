const raymarchfrag = glsl`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec3 startpoint;
varying vec3 curraydir;

const float eps 			= 0.03333;  

float sphere0(vec3 p)
{
	const float	sphereradius 	= 3.0;
	const vec3 	spherePos 		= vec3(2.0, 2.0, -5.0);

    return length(p - spherePos) - sphereradius;
}
/*
vec3 col(vec3 p)
{
    return vec3(sin(p.x * 3.142) * 0.5f + 0.5f, sin(p.y * 3.142) * 0.5f + 0.5f, sin(p.z * 3.142) * 0.5f + 0.5f);
}
*/

float getDist(vec3 p)
{
	p.x = abs(p.x);
	p.y = abs(p.y);

	return sphere0(p);
}

vec3 getNormal(vec3 p, float r)
{
	vec3 	L = p + vec3( -r, 0.0, 0.0),
			R = p + vec3(  r, 0.0, 0.0),
			U = p + vec3(0.0,   r, 0.0),
			D = p + vec3(0.0,  -r, 0.0),
			F = p + vec3(0.0, 0.0,   r),
			B = p + vec3(0.0, 0.0,  -r);

	return normalize(vec3(getDist(R) - getDist(L), getDist(U) - getDist(D), getDist(F) - getDist(B)));
}



vec4 getLight(vec3 p, vec3 n)
{
	const vec3 	zp 				= vec3(0.0, 10.0, 0.0);	
	const float zr 				= 0.10;

	vec3 	zn		= normalize(zp - p);
	float 	dotzn 	= dot(zn, n),
			l 		= 1.0;

	for(int safetyCount = 0; safetyCount < 120; safetyCount++)
    {
		float d 	 = getDist(p);
		float zd	 = length(zp - p);
        p 			+= zn * min(d, zd);
		
		if(zd <= zr)
			return dotzn *  vec4(1.0);

		if(d <= eps)
			return dotzn *  vec4(l);

		if(d < 1.0)
			l = min(l, d);
			
	}

	return vec4(1.0);

}


vec4 march()
{
	vec3 		p 	= startpoint;
	float 		d	= getDist(p);
	
	for(int safetyCount = 0; safetyCount < 120; safetyCount++)
    {
		if(d <= eps)
		{
			vec3 n = getNormal(p, 0.125);
			//return vec4(n, 1.0);
			
			return getLight(p + (n * eps), n);
		}

		p += curraydir * max(0.0, d);
		d  = getDist(p);
	}

	
	float whiteness = max(0.0, curraydir.y);
	
	return vec4(whiteness, whiteness, max(whiteness, 0.666), 1.0);
}

void main()
{
	gl_FragColor = march();
}
`