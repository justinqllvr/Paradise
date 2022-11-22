precision highp float;

float easeOutCubic(float number) {
return 1. - pow(1. - number, 3.);
}

varying vec2 vUv;

uniform float uTime;

void main() {
    vec2 uv = vUv;

    vec3 color = vec3( 0.17, .4, 0.15).rgb;
    //Ajouter un easing
    float mask = step(uv.x,1. * easeOutCubic(min(uTime * .2, 1.)) );
    vec3 finalColor = vec3(mask * color);
    

   gl_FragColor = vec4(finalColor, mask);
}
