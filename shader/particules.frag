precision highp float;

varying vec3 vColor;
varying vec2 vUv;
varying vec3 vOrigine;
varying vec3 vPosition;

uniform float uTime;
uniform float uParticuleColorFromCenter;
uniform float uVolume;
uniform float uProgress;

void main() {
   vec2 uv = gl_PointCoord;
   vec3 color = vColor;
   float distanceFromCenter = 1. - (distance(vPosition, vOrigine) - .6) * .5;
   float distanceFromCenterRed = (distance(vPosition, vOrigine) - .8) * .5 + .5;


   if(uProgress >= .99) {
      color = vec3(1., distanceFromCenter, distanceFromCenter);
   } else if(uProgress <= .5) {
      color = vec3(1., distanceFromCenterRed, distanceFromCenterRed);
   }

   float dist = distance(uv, vec2(.5));

   float mask = 1.-step(.3, dist);
   if(mask == 0. || uTime == 0. ) {
      discard;
   } 
   // color *= mask;
   gl_FragColor = vec4(color, mask);
}
