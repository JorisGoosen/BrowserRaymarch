const raymarchfrag = glsl`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

varying vec3 startpoint;
varying vec3 curraydir;

uniform float time;

const float eps 			= 0.001;  

const vec3 	zp 				= vec3(-10.0, 10.0, 15.0);	
const float zr 				= 1.0;

float sphereDistort(vec3 p)
{
	return mix(cnoise(p * 3.0), 1.0, 0.1) * mix(cnoise(p * 12.0), 1.0, 0.1) * mix(cnoise(p * 66.0), 1.0, 0.1);
}

float sphere0(vec3 p)
{
	const float	sphereradius 	= 15.0;
	const vec3 	spherePos 		= vec3(0.0, 0.0, 0.0);

    return length(p - spherePos) - sphereradius;
}

float sphereZon(vec3 p)
{
    return length(p - zp) - zr;
}

vec4 col(vec3 p)
{
    vec4 c = vec4(0.5 + 0.5 * sphereDistort(p));

	//return vec4(c.x * c.y * c.z);
	return c;
}


float getDist(vec3 p)
{
	//p.x = abs(p.x);
	//p.y = abs(p.y);

/*	const float m = 2.0;
	p.x = acos(cos(p.x / m)) * m;
	p.y = asin(sin(p.y / m)) * m;*/


	return min(sphereZon(p), sphere0(p));
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


vec3 getNormalDistorted(vec3 p, float r)
{
	vec3 	n = getNormal(p, r);
	vec3	o = normalize(vec3(-1.0) + (2.0 * vec3(cnoise(p * 19.00), cnoise(p * 3.0), cnoise(p * 7.0))));
	return 	normalize(n + (o * 0.4));
}


vec4 getLight(vec3 p, vec3 n)
{


	vec3 	zn		= normalize(zp - p);
	float 	dotzn 	= dot(zn, n),
			l 		= 1.0;

	for(int safetyCount = 0; safetyCount < 240; safetyCount++)
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

vec4 getLucht(vec3 p)
{
	float				starness	= cnoise(p * 6.0);//min(1.0, (2.0 * abs(radiation.x)) * (2.0 * abs(radiation.y)) * (2.0 * abs(radiation.z)));
	const float 		sc			= 0.7;
	if(starness < sc)	starness 	= 0.0;
	else				starness 	= (starness - sc) / (1.0 - sc);
	
	
	return vec4(starness);//pow(starness, 2.2));
}


vec4 march()
{
	vec3 				p 			= startpoint;
	float 				d			= getDist(p),
						t			= 0.0;
	const float 		maxMist		= 200.0,
						minMist		= 100.0;

	

	for(int safetyCount = 0; safetyCount < 600; safetyCount++)
    {
		t += d;
		if(t > maxMist) return getLucht(p);

		if(d <= eps)
		{
			if(sphereZon(p) <= eps)
				return vec4(1.0);

			vec3 n = getNormalDistorted(p, 0.125);
			//return vec4(n, 1.0);
			
			float mist = 0.0;

			if(t > minMist)
				mist = (t - minMist ) / (maxMist - minMist);

			return mix(col(p), getLucht(p), mist) * max(vec4(0.05), getLight(p, n));
		}

		p += curraydir * max(0.0, d);
		d  = getDist(p);
	}

	return getLucht(p);

	
}

void main()
{
	gl_FragColor = march();
}
`