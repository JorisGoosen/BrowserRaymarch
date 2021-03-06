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
varying vec3 zonPos;
varying vec3 maanPos;

uniform float time;
uniform float zoom;

const float eps 			= 0.01;  
const float	waterRadius 	= 6.0;
const float	ijsRadius		= 6.3;
const float grasRadius		= (ijsRadius - waterRadius) * 0.5 + waterRadius;
const vec3 	wereldPos 		= vec3(0.0, 0.0, 0.0);


float waterDist(vec3 p)
{
	return length(p - wereldPos) - waterRadius;
}

float ijsDist(vec3 p)
{
	float d = length(p - wereldPos) - ijsRadius;

	float hoek = atan(p.x, p.z);

	d = max(
		d, 
		min(
			 p.y + ijsRadius * 0.65, 
			-p.y + ijsRadius * 0.65
		) 
		- (0.25 * sin(hoek * 66.0)) 
		+ (1.00 * sin(hoek *  3.0)) 
		+ (0.60 * sin(hoek * 24.0)) 
		* ijsRadius
		* 0.05 
	);

	return d;
}

float grasDist(vec3 p)
{
	float d = length(p - wereldPos) - grasRadius ;
	float hoek = atan(p.x, p.z);

	return max(
		d, 
		min(
			 p.y + grasRadius * 0.25, 
			-p.y + grasRadius * 0.25
		)
		- (0.29 * sin(hoek * 20.222)) 
		+ (0.80 * sin(hoek *  3.70)) 
		+ (0.10 * sin(hoek * 51.2))
		);
}

const float	zonRad 	= 1.0;
const vec4	zonCol	= vec4(1.0, 1.0, 0.75, 1.0);

float zonDist(vec3 p)
{
	return length(p - zonPos) - zonRad;
}

float getDist(vec3 p)
{
	return min(min(zonDist(p), grasDist(p)), min(waterDist(p), ijsDist(p)));
}

int whoAmi(vec3 p)
{
	float 	watD 	= waterDist(p), 
			ijsD 	= ijsDist(p), 
			grasD 	= grasDist(p),
			zonD	= zonDist(p),
			minD	= min(min(watD, ijsD), min(grasD, zonD));

		 if(zonD  == minD) return 0;
	else if(ijsD  == minD) return 2;
	else if(grasD == minD) return 3;	
	//else if(watD  == minD) 
	return 1;
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
	float slowTime = time * 0.001;
	vec3 	n = getNormal(p, r);

	float mult = 40.0 / zoom;

	float 	a = cnoise(slowTime + (p * mult));
	float 	b = cnoise(slowTime + (n * mult));
	float 	cb = cos(b);
	vec3	o = vec3(sin(a) * cb, cos(b) * cb, sin(b)); 
	
	const float kleiner = 2.0;
				slowTime *= kleiner;
				mult 	*= kleiner;
				a 		= cnoise(slowTime + (p * mult));
				b 		= cnoise(slowTime + (n * mult));
				cb 		= cos(b);
	vec3		o2		= vec3(sin(a) * cb, cos(b) * cb, sin(b));

	return 	normalize(n + (o * 0.35)+ (o2 * 0.25));
}

vec3 getGrasNormal(vec3 p, float r)
{
	vec3 	n 		= getNormal(p, r);
	float 	hoeka 	= atan(p.x, p.z) * cnoise(time + (p * 10000.0)),
			hoekb 	= atan(p.x, p.y);
	vec3 	o 		= vec3(sin(hoeka) * sin(hoekb), cos(hoeka) * sin(hoekb), cos(hoekb)); 
	return 	normalize(n + (o * 0.35));
}

vec3 getIjsNormal(vec3 p, float r)
{
	vec3 	n = getNormal(p, r);

	float mult = 12.0 * zoom;

	float 	a = cnoise(p * mult);
	
	
	vec3	o = vec3(sin(a * 15.0), sin(a * 33.0), sin(a * 45.0)); 

	return 	normalize(n + (o * 0.15));
}

const int maxIt = 300;

vec4 getLightFromSun(vec3 p, vec3 n, vec4 c)
{
	p += n * eps * 1.5;

	vec3 	zn		= normalize(zonPos - p);
	float	refzn	= dot(zn, reflect(curraydir, n));
	float 	dotzn 	= dot(zn, n);
	float	cn		= dot(curraydir, n);
	vec4 	deflt	= abs(cn) * c;
	//if(refzn < 0.0)	refzn = 0.0;
	//else			
	refzn = pow(max(0.0, refzn), 9.5);
	
	//if(refzn > 0.5 && refzn > dotzn)
	//	dotzn = refzn;

	float 	t = 0.0, 
			d = 0.0, 
			zd = 0.0, 
			md = 0.0,
			res = 1.0;
	vec3 	tp;
	const float k = 2.0;

	for(int safetyCount = 0; safetyCount < maxIt; safetyCount++)
    {
		tp	= p + (zn * t);
		d   = getDist(tp);
		zd  = zonDist(tp);
		md  = min(zd, d);
		
       // res = min( res, k*md/t );
		t  += max(0.0, md);
		
		if(zd <= eps)
			return max(deflt, max(dotzn * c, vec4(refzn)) * zonCol * res); // zonCol

		if(d <= eps && t > eps * 2.0)
			return deflt;
	}

	return deflt;
}


vec4 getLight(vec3 p, vec3 n, vec4 c)
{
	return getLightFromSun(p, n, c);
}

vec4 getLucht()
{
	return vec4(0.0);
	/*vec3 zonDirFromStart 	= normalize(zonPos - startpoint);
	float whiteness 		= dot(zonDirFromStart, curraydir);

	return vec4(whiteness, whiteness, max(0.8, whiteness), 1.0);*/
}


vec4 march()
{
	vec3 				p 	= startpoint;
	float 				d	= getDist(p),
						t	= 0.0;

	for(int safetyCount = 0; safetyCount < maxIt; safetyCount++)
    {
		if(d <= eps)
		{
			int who = whoAmi(p);
			float mult = 1.0;// (float(safetyCount) / 10.0);
			if(who == 0)	return zonCol * mult;
			if(who == 2)	return getLight(p, getIjsNormal(p, 0.125), vec4(0.8, 0.8, 1.0, 1.0)) * mult;
			if(who == 3)	return getLight(p, getGrasNormal(p, 0.125), vec4(0.1, 0.4, 0.0, 1.0)) * mult;

			return getLight(p, getNormalDistorted(p, 0.125), vec4(0.0, 0.0, 1.0, 1.0))  * mult;
		}

		if(d > 0.0)
		{
			t += d;
			p = startpoint + (curraydir * t);
		}

		if(t > 600.0)
			return getLucht();

		d  = getDist(p);
	}

	return getLucht();
}

void main()
{
	
	gl_FragColor = march();
}
`