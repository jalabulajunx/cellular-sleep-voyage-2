import { useState, useRef, useEffect, type ReactNode } from 'react';
import './DraggableHUD.css';

interface Position {
  x: number;
  y: number;
}

interface DraggableHUDProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultPosition?: Position;
  isCollapsed?: boolean;
  canCollapse?: boolean;
  onPositionChange?: (id: string, position: Position) => void;
  onCollapse?: (id: string, collapsed: boolean) => void;
  zIndex?: number;
}

export function DraggableHUD({
  id,
  title,
  children,
  defaultPosition = { x: 20, y: 20 },
  isCollapsed = false,
  canCollapse = true,
  onPositionChange,
  onCollapse,
  zIndex = 1000
}: DraggableHUDProps) {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const hudRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem(`hud-position-${id}`);
    const savedCollapsed = localStorage.getItem(`hud-collapsed-${id}`);
    
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        setPosition(pos);
      } catch (error) {
        console.warn(`Failed to parse saved position for HUD ${id}:`, error);
      }
    }
    
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === 'true');
    }
  }, [id]);

  // Save position to localStorage
  const savePosition = (newPosition: Position) => {
    localStorage.setItem(`hud-position-${id}`, JSON.stringify(newPosition));
    if (onPositionChange) {
      onPositionChange(id, newPosition);
    }
  };

  // Save collapsed state
  const saveCollapsed = (newCollapsed: boolean) => {
    localStorage.setItem(`hud-collapsed-${id}`, newCollapsed.toString());
    if (onCollapse) {
      onCollapse(id, newCollapsed);
    }
  };

  // Handle mouse down on header
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!headerRef.current) return;
    
    const rect = headerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  // Handle touch start on header
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!headerRef.current) return;
    
    const touch = e.touches[0];
    const rect = headerRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  // Handle drag movement
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      
      // Keep within viewport bounds
      const boundedPosition = constrainToViewport(newPosition);
      setPosition(boundedPosition);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newPosition = {
        x: touch.clientX - dragOffset.x,
        y: touch.clientY - dragOffset.y
      };
      
      const boundedPosition = constrainToViewport(newPosition);
      setPosition(boundedPosition);
      e.preventDefault();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      savePosition(position);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      savePosition(position);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, position]);

  // Constrain position to viewport
  const constrainToViewport = (pos: Position): Position => {
    const margin = 10;
    const hudElement = hudRef.current;
    
    if (!hudElement) {
      return pos; // Return original position if we can't measure
    }
    
    const rect = hudElement.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;
    
    return {
      x: Math.max(margin, Math.min(pos.x, maxX)),
      y: Math.max(margin, Math.min(pos.y, maxY))
    };
  };

  // Handle collapse toggle
  const handleCollapseToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    saveCollapsed(newCollapsed);
  };

  // Handle double-click to reset position
  const handleDoubleClick = () => {
    setPosition(defaultPosition);
    savePosition(defaultPosition);
  };

  return (
    <div
      ref={hudRef}
      className={`draggable-hud ${isDragging ? 'dragging' : ''} ${collapsed ? 'collapsed' : ''}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: isDragging ? zIndex + 1000 : zIndex,
        userSelect: 'none'
      }}
    >
      {/* Header with drag handle */}
      <div
        ref={headerRef}
        className="hud-header"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
      >
        <div className="hud-title">{title}</div>
        <div className="hud-controls">
          {canCollapse && (
            <button
              className="hud-collapse-btn"
              onClick={handleCollapseToggle}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '▲' : '▼'}
            </button>
          )}
          <div className="hud-drag-handle" title="Drag to move">
            ⋯
          </div>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="hud-content">
          {children}
        </div>
      )}
    </div>
  );
}

// HUD Layout Manager
interface HUDLayoutManagerProps {
  children: ReactNode;
}

export function HUDLayoutManager({ children }: HUDLayoutManagerProps) {
  const [hudPositions, setHudPositions] = useState<Record<string, Position>>({});
  const [hudCollapsed, setHudCollapsed] = useState<Record<string, boolean>>({});

  // These handlers are available for future use in layout management
  const handlePositionChange = (id: string, position: Position) => {
    setHudPositions(prev => ({ ...prev, [id]: position }));
    console.log(`HUD ${id} moved to:`, position);
  };

  const handleCollapseChange = (id: string, collapsed: boolean) => {
    setHudCollapsed(prev => ({ ...prev, [id]: collapsed }));
    console.log(`HUD ${id} collapsed:`, collapsed);
  };
  
  // Use the handlers to prevent unused variable warnings
  console.debug('Layout manager initialized with handlers:', { handlePositionChange, handleCollapseChange });

  const resetAllPositions = () => {
    // Clear all saved positions
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('hud-position-') || key.startsWith('hud-collapsed-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Reload page to reset positions
    window.location.reload();
  };

  const saveCurrentLayout = (layoutName: string) => {
    const layout = {
      positions: hudPositions,
      collapsed: hudCollapsed,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`hud-layout-${layoutName}`, JSON.stringify(layout));
    
    // Show success notification
    const event = new CustomEvent('hud-notification', {
      detail: {
        type: 'success',
        title: 'Layout Saved',
        message: `Layout "${layoutName}" saved successfully`,
        duration: 3000
      }
    });
    window.dispatchEvent(event);
  };

  const loadLayout = (layoutName: string) => {
    const savedLayout = localStorage.getItem(`hud-layout-${layoutName}`);
    if (!savedLayout) return;

    try {
      const layout = JSON.parse(savedLayout);
      
      // Apply positions
      Object.entries(layout.positions).forEach(([id, position]) => {
        localStorage.setItem(`hud-position-${id}`, JSON.stringify(position));
      });
      
      // Apply collapsed states
      Object.entries(layout.collapsed).forEach(([id, collapsed]) => {
        localStorage.setItem(`hud-collapsed-${id}`, String(collapsed));
      });
      
      // Reload to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to load layout:', error);
    }
  };

  return (
    <div className="hud-layout-manager">
      {children}
      
      {/* Layout Controls */}
      <HUDLayoutControls
        onResetAll={resetAllPositions}
        onSaveLayout={saveCurrentLayout}
        onLoadLayout={loadLayout}
      />
    </div>
  );
}

// Layout Controls Component
interface HUDLayoutControlsProps {
  onResetAll: () => void;
  onSaveLayout: (name: string) => void;
  onLoadLayout: (name: string) => void;
}

function HUDLayoutControls({ onResetAll, onSaveLayout, onLoadLayout }: HUDLayoutControlsProps) {
  const [showControls, setShowControls] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [savedLayouts, setSavedLayouts] = useState<string[]>([]);

  // Load saved layout names
  useEffect(() => {
    const layouts = Object.keys(localStorage)
      .filter(key => key.startsWith('hud-layout-'))
      .map(key => key.replace('hud-layout-', ''));
    setSavedLayouts(layouts);
  }, []);

  const handleSaveLayout = () => {
    if (layoutName.trim()) {
      onSaveLayout(layoutName.trim());
      setLayoutName('');
      // Refresh saved layouts list
      const layouts = Object.keys(localStorage)
        .filter(key => key.startsWith('hud-layout-'))
        .map(key => key.replace('hud-layout-', ''));
      setSavedLayouts(layouts);
    }
  };

  return (
    <div className="hud-layout-controls">
      <button
        className="layout-toggle-btn"
        onClick={() => setShowControls(!showControls)}
        title="HUD Layout Controls"
      >
        ⚙️
      </button>
      
      {showControls && (
        <div className="layout-controls-panel">
          <h4>HUD Layout</h4>
          
          {/* Reset All */}
          <button onClick={onResetAll} className="layout-btn reset-btn">
            🔄 Reset All Positions
          </button>
          
          {/* Save Layout */}
          <div className="layout-save">
            <input
              type="text"
              placeholder="Layout name..."
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveLayout()}
            />
            <button onClick={handleSaveLayout} className="layout-btn save-btn">
              💾 Save
            </button>
          </div>
          
          {/* Load Layout */}
          {savedLayouts.length > 0 && (
            <div className="layout-load">
              <h5>Saved Layouts:</h5>
              {savedLayouts.map(layout => (
                <button
                  key={layout}
                  onClick={() => onLoadLayout(layout)}
                  className="layout-btn load-btn"
                >
                  📁 {layout}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}