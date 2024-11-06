export const PBRMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      lightPosition: { value: new THREE.Vector3(5.0, 5.0, 5.0) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
  
      uniform vec3 lightPosition;
      uniform float time;
  
      // Fresnel effect for metallic reflection
      float fresnel(vec3 viewDir, vec3 normal) {
        return pow(1.0 - dot(viewDir, normal), 3.0);
      }
  
      // Simple lighting calculation
      vec3 calculateLighting(vec3 normal, vec3 lightDir, vec3 viewDir) {
        // Ambient component
        vec3 ambient = vec3(0.1);
        
        // Diffuse component
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * vec3(0.8, 0.7, 0.6);
  
        // Specular component for a metallic sheen
        vec3 halfwayDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfwayDir), 0.0), 16.0);
        vec3 specular = spec * vec3(1.0);
  
        return ambient + diffuse + specular;
      }
  
      void main() {
        // Calculate view direction and light direction
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 lightDir = normalize(lightPosition - vWorldPosition);
  
        // Calculate lighting with metallic sheen
        vec3 normal = normalize(vNormal);
        vec3 lighting = calculateLighting(normal, lightDir, viewDir);
  
        // Apply Fresnel effect for realistic reflection on edges
        float fresnelFactor = fresnel(viewDir, normal);
        vec3 finalColor = mix(lighting, vec3(1.0, 0.9, 0.8), fresnelFactor);
  
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });
  