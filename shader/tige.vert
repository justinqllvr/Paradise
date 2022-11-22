precision highp float;

attribute vec2 uv;
attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUv;

void main() {
   vUv = uv;
   
    vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
   gl_Position = pos;
}
