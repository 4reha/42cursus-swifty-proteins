import { useToast } from "@/contexts/ToastContext";
import { ParsedLigandData } from "@/types/ligand.types";
import { theme } from "@/styles/theme";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
} from "react-native-gesture-handler";
import * as THREE from "three";

type Molecule3DViewerProps = {
  data: ParsedLigandData | null;
  style?: any;
};

// CPK Colors (Corey-Pauling-Koltun coloring scheme)
const CPK_COLORS: Record<string, number> = {
  H: 0xffffff, // White
  C: 0x909090, // Gray
  N: 0x3050f8, // Blue
  O: 0xff0d0d, // Red
  F: 0x90e050, // Green
  CL: 0x1ff01f, // Green
  BR: 0xa62929, // Brown
  I: 0x940094, // Purple
  P: 0xff8000, // Orange
  S: 0xffff30, // Yellow
  B: 0xffb5b5, // Pink
  LI: 0xcc80ff, // Violet
  NA: 0xab5cf2, // Violet
  MG: 0x8aff00, // Green
  AL: 0xbfa6a6, // Gray
  SI: 0xf0c8a0, // Tan
  K: 0x8f40d4, // Purple
  CA: 0x3dff00, // Green
  TI: 0xbfc2c7, // Gray
  CR: 0x8a99c7, // Gray
  MN: 0x9c7ac7, // Gray
  FE: 0xe06633, // Orange
  NI: 0x50d050, // Green
  CU: 0xc88033, // Brown
  ZN: 0x7d80b0, // Blue-gray
  GA: 0xc28f8f, // Brown
  GE: 0x668f8f, // Gray
  AS: 0xbd80e3, // Purple
  SE: 0xffa100, // Orange
  AG: 0xc0c0c0, // Silver
  SN: 0x668080, // Gray
  AU: 0xffd123, // Gold
  HG: 0xb8b8d0, // Gray
};

export default function Molecule3DViewer({
  data,
  style,
}: Molecule3DViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderStyle, setRenderStyle] = useState<
    "stick" | "sphere" | "ballStick"
  >("ballStick");
  const [autoRotate, setAutoRotate] = useState(true);
  const [glKey, setGlKey] = useState(0);
  const { showToast } = useToast();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);

  // Gesture state
  const rotationRef = useRef({ x: 0, y: 0 });
  const lastPanRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(20);
  const lastScaleRef = useRef(1);
  const autoRotateRef = useRef(true);

  // Reset loading state and force GLView remount when data changes
  useEffect(() => {
    if (data && data.atoms && data.atoms.length > 0) {
      setLoading(true);
      setError(null);
      setGlKey((prev) => prev + 1); // Force GLView remount
    }
  }, [data]);

  // Sync autoRotate ref with state
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, []);

  if (!data || !data.atoms || data.atoms.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.noDataContainer}>
          <MCIcons name="molecule" size={64} color="#667eea" />
          <Text style={styles.noDataText}>No molecule data available</Text>
        </View>
      </View>
    );
  }

  const getAtomColor = (element: string): number => {
    const el = element.toUpperCase();
    return CPK_COLORS[el] || 0xff1493; // Default: hot pink for unknown elements
  };

  const showStyleToast = (style: "stick" | "sphere" | "ballStick") => {
    const styleNames = {
      ballStick: "Ball & Stick",
      sphere: "Sphere",
      stick: "Stick",
    };

    showToast(`Switched to ${styleNames[style]} representation`, 2000);
  };

  /**
   * Parse bond order from string or number
   */
  const parseBondOrder = (order: string | number | undefined): number => {
    if (order === undefined || order === null) return 1;

    const orderStr = String(order).toUpperCase();

    // Check for common bond order patterns
    if (orderStr.includes("SING") || orderStr === "1" || orderStr === "S")
      return 1;
    if (orderStr.includes("DOUB") || orderStr === "2" || orderStr === "D")
      return 2;
    if (orderStr.includes("TRIP") || orderStr === "3" || orderStr === "T")
      return 3;

    // Try to parse as number
    const num = parseInt(orderStr);
    return isNaN(num) ? 1 : Math.min(Math.max(num, 1), 3); // Clamp between 1-3
  };

  /**
   * Create a single bond cylinder
   */
  const createBondCylinder = (
    start: THREE.Vector3,
    end: THREE.Vector3,
    radius: number,
    offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ): THREE.Mesh => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const midpoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);

    const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
    const material = new THREE.MeshPhongMaterial({
      color: 0x808080,
      shininess: 20,
    });

    const cylinder = new THREE.Mesh(geometry, material);

    // Apply offset before positioning
    const offsetMidpoint = midpoint.clone().add(offset);
    cylinder.position.copy(offsetMidpoint);

    // Rotate cylinder to align with bond direction
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      axis,
      direction.normalize()
    );
    cylinder.quaternion.copy(quaternion);

    return cylinder;
  };

  /**
   * Create bond(s) based on bond order
   */
  const createBond = (
    start: THREE.Vector3,
    end: THREE.Vector3,
    bondOrder: number,
    bondRadius: number
  ): THREE.Mesh[] => {
    const cylinders: THREE.Mesh[] = [];

    if (bondOrder === 1) {
      // Single bond - one cylinder
      cylinders.push(createBondCylinder(start, end, bondRadius));
    } else if (bondOrder === 2) {
      // Double bond - two parallel cylinders
      const direction = new THREE.Vector3().subVectors(end, start).normalize();

      // Calculate perpendicular offset
      const up =
        Math.abs(direction.y) < 0.99
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(1, 0, 0);

      const perpendicular = new THREE.Vector3()
        .crossVectors(direction, up)
        .normalize();

      const offset = bondRadius * 2; // Spacing between double bond lines

      // Create two parallel cylinders
      const offset1 = perpendicular.clone().multiplyScalar(offset);
      const offset2 = perpendicular.clone().multiplyScalar(-offset);

      cylinders.push(createBondCylinder(start, end, bondRadius * 0.8, offset1));
      cylinders.push(createBondCylinder(start, end, bondRadius * 0.8, offset2));
    } else if (bondOrder === 3) {
      // Triple bond - three cylinders in triangular arrangement
      const direction = new THREE.Vector3().subVectors(end, start).normalize();

      const up =
        Math.abs(direction.y) < 0.99
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(1, 0, 0);

      const perpendicular = new THREE.Vector3()
        .crossVectors(direction, up)
        .normalize();

      const offset = bondRadius * 2;

      // Center cylinder
      cylinders.push(createBondCylinder(start, end, bondRadius * 0.7));

      // Two offset cylinders
      const offset1 = perpendicular.clone().multiplyScalar(offset);
      const offset2 = perpendicular.clone().multiplyScalar(-offset);

      cylinders.push(createBondCylinder(start, end, bondRadius * 0.7, offset1));
      cylinders.push(createBondCylinder(start, end, bondRadius * 0.7, offset2));
    }

    return cylinders;
  };

  const createMolecule = (
    scene: THREE.Scene,
    style: "stick" | "sphere" | "ballStick" = renderStyle
  ) => {
    const moleculeGroup = new THREE.Group();

    // Create atoms
    const atomMeshes: THREE.Mesh[] = [];
    data.atoms?.forEach((atom) => {
      const x = atom.idealX ?? atom.x ?? 0;
      const y = atom.idealY ?? atom.y ?? 0;
      const z = atom.idealZ ?? atom.z ?? 0;

      const color = getAtomColor(atom.element || "C");

      // Sphere for atom
      let sphereRadius = 0.3;
      if (style === "sphere") {
        sphereRadius = 0.5;
      } else if (style === "stick") {
        sphereRadius = 0.15;
      }

      const geometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color,
        shininess: 30,
        specular: 0x222222,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.userData = {
        atomId: atom.atomId,
        element: atom.element,
        type: "atom",
      };

      moleculeGroup.add(sphere);
      atomMeshes.push(sphere);
    });

    // Create bonds with proper bond order
    data.bonds?.forEach((bond) => {
      const atom1 = data.atoms?.find((a) => a.atomId === bond.a);
      const atom2 = data.atoms?.find((a) => a.atomId === bond.b);

      if (atom1 && atom2) {
        const x1 = atom1.idealX ?? atom1.x ?? 0;
        const y1 = atom1.idealY ?? atom1.y ?? 0;
        const z1 = atom1.idealZ ?? atom1.z ?? 0;

        const x2 = atom2.idealX ?? atom2.x ?? 0;
        const y2 = atom2.idealY ?? atom2.y ?? 0;
        const z2 = atom2.idealZ ?? atom2.z ?? 0;

        const start = new THREE.Vector3(x1, y1, z1);
        const end = new THREE.Vector3(x2, y2, z2);

        // Parse bond order
        const bondOrder = parseBondOrder(bond.order);

        // Get appropriate bond radius
        const bondRadius = style === "stick" ? 0.1 : 0.08;

        // Create bond cylinders based on order
        const bondCylinders = createBond(start, end, bondOrder, bondRadius);

        bondCylinders.forEach((cylinder) => {
          cylinder.userData = {
            type: "bond",
            order: bondOrder,
            atoms: `${bond.a}-${bond.b}`,
          };
          moleculeGroup.add(cylinder);
        });
      }
    });

    // Center the molecule
    const box = new THREE.Box3().setFromObject(moleculeGroup);
    const center = box.getCenter(new THREE.Vector3());
    moleculeGroup.position.sub(center);

    scene.add(moleculeGroup);
    moleculeGroupRef.current = moleculeGroup;

    // Log bond information for debugging
    console.log("🔗 Bonds created:");
    data.bonds?.forEach((bond) => {
      const order = parseBondOrder(bond.order);
      console.log(
        `  ${bond.a}-${bond.b}: ${
          order === 1 ? "Single" : order === 2 ? "Double" : "Triple"
        } bond`
      );
    });
  };

  const changeStyle = (newStyle: "stick" | "sphere" | "ballStick") => {
    setRenderStyle(newStyle);
    showStyleToast(newStyle);

    if (sceneRef.current && moleculeGroupRef.current) {
      sceneRef.current.remove(moleculeGroupRef.current);
      createMolecule(sceneRef.current, newStyle);
    }
  };

  const resetView = () => {
    // Reset rotation
    rotationRef.current = { x: 0, y: 0 };
    lastPanRef.current = { x: 0, y: 0 };

    // Reset zoom
    zoomRef.current = 20;
    lastScaleRef.current = 1;

    // Stop auto-rotation
    setAutoRotate(true);
    autoRotateRef.current = true;

    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 20);
      cameraRef.current.lookAt(0, 0, 0);
    }

    if (moleculeGroupRef.current) {
      moleculeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const toggleAutoRotate = () => {
    const newAutoRotate = !autoRotate;
    setAutoRotate(newAutoRotate);
    autoRotateRef.current = newAutoRotate;
  };

  // Pan gesture handler (for rotation)
  const onPanGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;

    if (moleculeGroupRef.current) {
      const deltaX = translationX - lastPanRef.current.x;
      const deltaY = translationY - lastPanRef.current.y;

      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;

      moleculeGroupRef.current.rotation.y = rotationRef.current.y;
      moleculeGroupRef.current.rotation.x = rotationRef.current.x;

      lastPanRef.current = { x: translationX, y: translationY };
    }
  };

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) {
      // ENDED
      lastPanRef.current = { x: 0, y: 0 };
    }
  };

  // Pinch gesture handler (for zoom)
  const onPinchGestureEvent = (event: any) => {
    const { scale } = event.nativeEvent;

    if (cameraRef.current) {
      const deltaScale = scale / lastScaleRef.current;
      zoomRef.current /= deltaScale;

      // Clamp zoom
      zoomRef.current = Math.max(5, Math.min(50, zoomRef.current));

      cameraRef.current.position.z = zoomRef.current;

      lastScaleRef.current = scale;
    }
  };

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) {
      // ENDED
      lastScaleRef.current = 1;
    }
  };

  const onContextCreate = async (gl: any) => {
    try {
      // Clean up previous renderer if it exists
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }

      // Initialize renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x1a1a2e);
      rendererRef.current = renderer;

      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        50,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 20);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 10);
      scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight2.position.set(-10, -10, -10);
      scene.add(directionalLight2);

      // Create molecule
      createMolecule(scene);

      setLoading(false);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        // Auto-rotate if enabled
        if (autoRotateRef.current && moleculeGroupRef.current) {
          rotationRef.current.y += 0.003;
          moleculeGroupRef.current.rotation.y = rotationRef.current.y;
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      animate();
    } catch (err: any) {
      console.error("Error initializing 3D scene:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Initializing 3D viewer...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
      >
        <View style={{ flex: 1 }}>
          <PinchGestureHandler
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
          >
            <View style={{ flex: 1 }}>
              <GLView
                key={glKey}
                style={styles.glView}
                onContextCreate={onContextCreate}
              />
            </View>
          </PinchGestureHandler>
        </View>
      </PanGestureHandler>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            renderStyle === "ballStick" && styles.controlButtonActive,
          ]}
          onPress={() => changeStyle("ballStick")}
        >
          <MCIcons name="atom" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            renderStyle === "sphere" && styles.controlButtonActive,
          ]}
          onPress={() => changeStyle("sphere")}
        >
          <MCIcons name="circle" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            renderStyle === "stick" && styles.controlButtonActive,
          ]}
          onPress={() => changeStyle("stick")}
        >
          <MCIcons name="minus" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            autoRotate && styles.controlButtonActive,
          ]}
          onPress={toggleAutoRotate}
        >
          <MCIcons
            name={autoRotate ? "pause" : "play"}
            size={18}
            color="#ffffff"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={resetView}>
          <MCIcons name="restore" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 500,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a2e",
  },
  glView: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 14,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    zIndex: 10,
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  noDataText: {
    color: "#ffffff",
    fontSize: 14,
  },
  controls: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    top: 10,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  controlButton: {
    backgroundColor: "rgba(102, 126, 234, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  controlButtonActive: {
    backgroundColor: "rgba(102, 126, 234, 1)",
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  controlText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
    zIndex: 100,
  },
  infoText: {
    color: "#ffffff",
    fontSize: 11,
  },
});
