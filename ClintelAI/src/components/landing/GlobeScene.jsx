'use client'

import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useTexture, Line } from '@react-three/drei'
import * as THREE from 'three'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

/* ---------------- CONFIG ---------------- */
const GLOBE_RADIUS = 100
const TARGET_POINTS = 16000  // Increased for denser, more premium look
const MIN_POINTS_PER_COUNTRY = 20
const SPRITE_SIZE = 400  // Adjusted for elegance
const POINT_DENSITY = 2.0
const DOT_COLOR = '#4DA8DA' // Pharma Blue Light
const BORDER_COLOR = '#0052A5' // Pharma Blue Dark
const HOVER_BORDER_COLOR = '#FFFFFF' // White on hover
const ROTATE_SPEED = 0.02 // Slower, more majestic rotation

/* ---------------- HELPERS ---------------- */
function latLngToVector3(lat, lng, altitude = 0) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    const r = GLOBE_RADIUS * (1 + altitude)
    return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
    )
}

function vector3ToLatLng(v) {
    const normalized = v.clone().normalize()
    const lat = 90 - (Math.acos(normalized.y) * 180) / Math.PI
    const lng = ((Math.atan2(normalized.z, -normalized.x) * 180) / Math.PI) - 180
    return {
        lat,
        lng: lng < -180 ? lng + 360 : (lng > 180 ? lng - 360 : lng)
    }
}

function getPathsFromGeoJson(geometry, altitude) {
    const paths = []
    const processRing = (ring) => ring.map((coord) => latLngToVector3(coord[1], coord[0], altitude))

    if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach((ring) => paths.push(processRing(ring)))
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygon) => {
            polygon.forEach((ring) => paths.push(processRing(ring)))
        })
    }
    return paths
}

/* ---------------- POINT CLOUD GENERATION ---------------- */
function createPointBuffers(countries, targetCount) {
    const positions = []
    const colors = []
    const sizes = []

    const dotColor = new THREE.Color(DOT_COLOR)

    const countryBuckets = []
    countries.forEach((c) => {
        if (!c.bbox) return
        if (c.properties?.ADMIN === 'Antarctica') return
        const [minLng, minLat, maxLng, maxLat] = c.bbox
        const area = (maxLng - minLng) * (maxLat - minLat)
        countryBuckets.push({ country: c, area, bbox: [minLng, minLat, maxLng, maxLat] })
    })

    const totalArea = countryBuckets.reduce((s, b) => s + Math.max(b.area, 0.001), 0)

    countryBuckets.forEach((b) => {
        const ratio = Math.max(b.area / totalArea, 0)
        b.count = Math.max(Math.floor(ratio * targetCount), MIN_POINTS_PER_COUNTRY)
    })

    countryBuckets.forEach((b) => {
        const poly = b.country
        const [minLng, minLat, maxLng, maxLat] = b.bbox
        let created = 0
        let tries = 0
        const maxTries = b.count * 15

        while (created < b.count && tries < maxTries) {
            tries++
            const lat = minLat + Math.random() * (maxLat - minLat)
            const lng = minLng + Math.random() * (maxLng - minLng)
            if (booleanPointInPolygon(point([lng, lat]), poly)) {
                const alt = 0.005 * POINT_DENSITY + Math.random() * 0.02 * POINT_DENSITY
                const v = latLngToVector3(lat, lng, alt)
                positions.push(v.x, v.y, v.z)

                colors.push(dotColor.r, dotColor.g, dotColor.b)
                sizes.push(1.0 + Math.random() * 3.0)
                created++
            }
        }
    })

    return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
        sizes: new Float32Array(sizes)
    }
}

/* ---------------- SHADERS ---------------- */
const vertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  varying vec3 vPosition;
  void main() {
    vColor = customColor;
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * ( ${SPRITE_SIZE.toFixed(1)} / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  varying vec3 vPosition;
  uniform sampler2D sprite;
  uniform float uTime;
  
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r = length(coord);
    if (r > 0.5) discard;
    float alpha = texture2D(sprite, gl_PointCoord).a;
    
    alpha *= smoothstep(0.5, 0.0, r) * 1.5;
    float glow = exp(-r * 3.0) * 0.8;
    
    // Wave Effect
    float angle = atan(vPosition.z, vPosition.x);
    float wave = sin(angle * 4.0 + uTime * 0.3); 
    wave = smoothstep(0.6, 1.0, wave); 
    
    float edgeFade = 1.0 - pow(abs(normalize(vPosition).y), 3.0);
    wave *= edgeFade * 0.6;
    
    float waveIntensity = wave * 4.0;
    vec3 waveColor = vec3(0.7, 0.9, 1.0); // Cyan-ish white wave
    
    vec3 finalColor = vColor + (vColor * glow * 1.2) + (waveColor * waveIntensity * 0.4);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`

/* ---------------- BORDERS ---------------- */
function AllBorders({ countries }) {
    const allPaths = useMemo(() => {
        return countries.flatMap(c => getPathsFromGeoJson(c.geometry, 0.05))
    }, [countries])

    return (
        <group>
            {allPaths.map((path, i) => (
                <Line
                    key={i}
                    points={path}
                    color={BORDER_COLOR}
                    lineWidth={0.5}
                    transparent
                    opacity={0.4}
                />
            ))}
        </group>
    )
}

function HoverBorder({ data }) {
    const lines = useMemo(() => {
        if (!data) return []
        return getPathsFromGeoJson(data.geometry, 0.08)
    }, [data])

    if (lines.length === 0) return null

    return (
        <group>
            {lines.map((path, i) => (
                <Line
                    key={`glow-${i}`}
                    points={path}
                    color="#ffffff"
                    lineWidth={2.0}
                    transparent
                    opacity={0.4}
                />
            ))}
            {lines.map((path, i) => (
                <Line
                    key={i}
                    points={path}
                    color="#ffffff"
                    lineWidth={1.5}
                    transparent
                    opacity={1.0}
                />
            ))}
        </group>
    )
}

/* ---------------- EARTH & INTERACTION ---------------- */
function Earth({ countries, onHover, onCountryClick }) {
    const earthTexture = useTexture('https://unpkg.com/three-globe/example/img/earth-dark.jpg')

    const handlePointerMove = useCallback((e) => {
        if (!countries || countries.length === 0) return
        const localPoint = e.object.worldToLocal(e.point.clone())
        const { lat, lng } = vector3ToLatLng(localPoint)
        if (isNaN(lat) || isNaN(lng)) return
        const candidates = countries.filter(c => {
            if (!c.bbox) return false
            const PADDING = 2
            const [_, minLat, __, maxLat] = c.bbox
            return lat >= (minLat - PADDING) && lat <= (maxLat + PADDING)
        })
        const pt = point([lng, lat])
        let match = null
        for (const c of candidates) {
            if (booleanPointInPolygon(pt, c)) {
                match = c
                break
            }
        }
        onHover(match)
    }, [countries, onHover])

    const handleClick = useCallback((e) => {
        if (!countries || countries.length === 0) return
        const localPoint = e.object.worldToLocal(e.point.clone())
        const { lat, lng } = vector3ToLatLng(localPoint)
        if (isNaN(lat) || isNaN(lng)) return
        const pt = point([lng, lat])
        for (const c of countries) {
            if (booleanPointInPolygon(pt, c)) {
                onCountryClick?.(c)
                break
            }
        }
    }, [countries, onCountryClick])

    return (
        <>
            {/* OCCLUDER - invisible sphere to block dots behind */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[GLOBE_RADIUS - 0.2, 64, 64]} />
                <meshBasicMaterial color="#000000" transparent opacity={0} />
            </mesh>

            {/* SURFACE - Transparent dark blue tint */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
                <meshPhongMaterial
                    color="#002244"
                    emissive="#001133"
                    specular="#111111"
                    shininess={5}
                    transparent={true}
                    opacity={0.9}
                />
            </mesh>

            {/* INTERACTION SPHERE */}
            <mesh
                visible={false}
                onPointerMove={handlePointerMove}
                onPointerOut={() => onHover(null)}
                onClick={handleClick}
            >
                <sphereGeometry args={[GLOBE_RADIUS + 0.1, 64, 64]} />
                <meshBasicMaterial side={THREE.DoubleSide} />
            </mesh>
        </>
    )
}

/* ---------------- SCENE POINTS ---------------- */
function GlobePoints({ countries }) {
    const sprite = useMemo(() => {
        const size = 128
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
        grad.addColorStop(0, 'rgba(135, 206, 250, 1)') // Light Sky Blue
        grad.addColorStop(0.4, 'rgba(77, 168, 218, 0.8)') // Pharma Blue
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, size, size)
        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [])

    const buffers = useMemo(() => {
        if (!countries || countries.length === 0) return null
        return createPointBuffers(countries, TARGET_POINTS)
    }, [countries])

    const geom = useMemo(() => {
        if (!buffers) return null
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(buffers.positions, 3))
        g.setAttribute('customColor', new THREE.BufferAttribute(buffers.colors, 3))
        g.setAttribute('size', new THREE.BufferAttribute(buffers.sizes, 1))
        return g
    }, [buffers])

    const mat = useMemo(() => {
        if (!buffers) return null
        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            blending: THREE.AdditiveBlending,
            uniforms: {
                sprite: { value: sprite },
                uTime: { value: 0 }
            }
        })
    }, [buffers, sprite])

    useFrame((state) => {
        if (mat) {
            mat.uniforms.uTime.value = state.clock.elapsedTime
        }
    })

    if (!geom || !mat) return null
    return <points geometry={geom} material={mat} />
}

/* ---------------- OCEAN GRID (FRESNEL) ---------------- */
function OceanGrid() {
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color('#4DA8DA') },
            },
            vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -mvPosition.xyz;
        }
      `,
            fragmentShader: `
        uniform vec3 color;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float dotProduct = dot(normal, viewDir);
          float fresnel = pow(1.0 - abs(dotProduct), 5.0); // Sharper edge
          if (fresnel < 0.1) discard;
          float glow = fresnel * 1.5;
          gl_FragColor = vec4(color * glow, fresnel * 0.3);
        }
      `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            wireframe: true,
        })
    }, [])

    return (
        <mesh>
            <icosahedronGeometry args={[GLOBE_RADIUS * 1.035, 12]} /> {/* More detailed grid */}
            <primitive object={material} attach="material" />
        </mesh>
    )
}

/* ---------------- INNER SCENE WRAPPER ---------------- */
function GlobeContent({ countries, hoveredCountry, setHoveredCountry, onCountryClick }) {
    const groupRef = useRef(null)

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += ROTATE_SPEED * delta
        }
    })

    return (
        <group ref={groupRef}>
            <Earth countries={countries} onHover={setHoveredCountry} onCountryClick={onCountryClick} />
            <OceanGrid />
            {countries.length > 0 && (
                <>
                    <GlobePoints countries={countries} />
                    <AllBorders countries={countries} />
                    <HoverBorder data={hoveredCountry} />
                </>
            )}

            {/* Atmosphere Glow */}
            <mesh scale={[1.1, 1.1, 1.1]}>
                <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
                <meshBasicMaterial
                    color="#4DA8DA"
                    transparent
                    opacity={0.05}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    )
}

/* ---------------- MAIN EXPORT ---------------- */
export default function GlobeR3F({
    geoJsonUrl = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson',
    onCountryClick
}) {
    const [countries, setCountries] = useState([])
    const [hoveredCountry, setHoveredCountry] = useState(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        let mounted = true
        fetch(geoJsonUrl)
            .then(r => r.json())
            .then(d => {
                if (!mounted) return
                setCountries(d.features || [])
            })
            .catch(err => console.error('Failed to load geojson', err))
        return () => { mounted = false }
    }, [geoJsonUrl])

    const handleMouseMove = useCallback((e) => {
        setMousePos({ x: e.clientX, y: e.clientY })
    }, [])

    const countryName = hoveredCountry?.properties?.ADMIN || hoveredCountry?.properties?.name || ''

    return (
        <div
            className={`w-full h-full relative bg-transparent ${hoveredCountry ? 'cursor-pointer' : 'cursor-default'}`}
            onMouseMove={handleMouseMove}
        >
            {/* Tooltip */}
            {countryName && (
                <div
                    className="fixed bg-white/90 text-primary px-4 py-2 font-sans rounded text-sm font-medium pointer-events-none z-[1000] border border-primary/20 backdrop-blur whitespace-nowrap shadow-[0_4px_20px_rgba(8,32,82,0.1)]"
                    style={{
                        left: mousePos.x + 15,
                        top: mousePos.y + 15,
                    }}
                >
                    {countryName}
                </div>
            )}

            <Canvas camera={{ position: [0, 0, 450], fov: 35 }} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={0.4} />
                <directionalLight intensity={0.8} position={[100, 50, 100]} color="#ffffff" />
                <pointLight position={[-200, -100, 100]} intensity={0.5} color="#4DA8DA" />

                <GlobeContent
                    countries={countries}
                    hoveredCountry={hoveredCountry}
                    setHoveredCountry={setHoveredCountry}
                    onCountryClick={onCountryClick}
                />

                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    autoRotate={true}
                    autoRotateSpeed={0.3}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                />

                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.5}
                        luminanceSmoothing={0.9}
                        height={300}
                        kernelSize={3}
                        intensity={1.2}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    )
}
