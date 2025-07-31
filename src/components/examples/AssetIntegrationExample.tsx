import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrganelleType } from '../../types';
import { 
  assetManager, 
  assetPreloader, 
  assetQualityManager,
  getOrganelleModel
} from '../../utils';

// Example component showing asset integration pipeline usage
const AssetIntegrationExample: React.FC = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedOrganelle, setSelectedOrganelle] = useState<OrganelleType>('mitochondria');
  const [cacheStatus, setCacheStatus] = useState<any>(null);

  useEffect(() => {
    initializeAssets();
  }, []);

  const initializeAssets = async () => {
    try {
      // Initialize the asset manager
      await assetManager.initialize();
      
      // Preload tutorial assets
      await assetPreloader.preloadTutorialAssets();
      
      // Load chapter 1 assets with progress tracking
      await assetManager.loadChapterAssets(1, (progress) => {
        setLoadingProgress(progress);
      });
      
      setIsLoaded(true);
      
      // Update cache status
      setCacheStatus(assetManager.getCacheStatus());
      
    } catch (error) {
      console.error('Failed to initialize assets:', error);
    }
  };

  const handleOrganelleChange = (organelle: OrganelleType) => {
    setSelectedOrganelle(organelle);
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    assetQualityManager.setQuality(quality);
    setCacheStatus(assetManager.getCacheStatus());
  };

  const organelleTypes: OrganelleType[] = [
    'mitochondria', 'nucleus', 'endoplasmic-reticulum',
    'golgi-apparatus', 'ribosomes', 'cell-membrane', 'cytoskeleton'
  ];

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold mb-4">Loading Assets...</div>
        <div className="w-64 bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-600 mt-2">{Math.round(loadingProgress)}%</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex">
      {/* 3D Viewer */}
      <div className="flex-1 bg-gray-900">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrganelleViewer organelleType={selectedOrganelle} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-white p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Asset Integration Demo</h2>
        
        {/* Organelle Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select Organelle</h3>
          <div className="grid grid-cols-1 gap-2">
            {organelleTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleOrganelleChange(type)}
                className={`p-2 text-left rounded transition-colors ${
                  selectedOrganelle === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Quality Level</h3>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((quality) => (
              <button
                key={quality}
                onClick={() => handleQualityChange(quality)}
                className={`px-3 py-1 rounded transition-colors ${
                  assetQualityManager.getCurrentQuality() === quality
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Current: {assetQualityManager.getCurrentQuality()}
          </p>
        </div>

        {/* Cache Status */}
        {cacheStatus && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Cache Status</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div>Assets: {cacheStatus.size}</div>
              <div>Memory: {cacheStatus.memoryUsageMB.toFixed(2)} MB</div>
              <div>Limit: {cacheStatus.memoryLimitMB} MB</div>
              <div>Usage: {cacheStatus.utilizationPercent.toFixed(1)}%</div>
            </div>
            <button
              onClick={() => {
                assetManager.clearCache();
                setCacheStatus(assetManager.getCacheStatus());
              }}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        )}

        {/* Asset Pipeline Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Pipeline Features</h3>
          <ul className="text-sm space-y-1">
            <li>✅ SVG to WebGL conversion</li>
            <li>✅ Multi-resolution support</li>
            <li>✅ Lazy loading</li>
            <li>✅ Asset compression</li>
            <li>✅ Memory management</li>
            <li>✅ Quality adaptation</li>
            <li>✅ Chapter-based optimization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 3D organelle viewer component
const OrganelleViewer: React.FC<{ organelleType: OrganelleType }> = ({ organelleType }) => {
  const [model, setModel] = useState<THREE.Mesh | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    loadOrganelleModel();
  }, [organelleType]);

  const loadOrganelleModel = async () => {
    try {
      const organelleModel = await getOrganelleModel(organelleType);
      
      // Remove previous model
      if (model) {
        scene.remove(model);
      }
      
      // Add new model
      scene.add(organelleModel);
      setModel(organelleModel);
      
    } catch (error) {
      console.error(`Failed to load ${organelleType} model:`, error);
    }
  };

  useFrame((state) => {
    if (model) {
      // Gentle rotation animation
      model.rotation.y += 0.01;
      model.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return null; // Model is added directly to scene
};



export default AssetIntegrationExample;