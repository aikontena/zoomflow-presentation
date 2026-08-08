import { CanvasObject } from "./canvas-store";
import { toast } from "sonner";

export interface CanvasDocument {
  objects: CanvasObject[];
  viewport: { x: number; y: number; zoom: number };
  presentationPath: string[];
}

export class TemplateLoader {
  /**
   * Processes a template and returns a valid CanvasDocument.
   * Ensures clean architecture: Separation of source data from store state.
   */
  static async load(templateData: any): Promise<CanvasDocument> {
    console.log("[TemplateLoader] Starting load process...");

    // 1. Validate JSON
    if (!templateData || typeof templateData !== 'object') {
      throw new Error("Invalid template data: Not an object");
    }

    const sourceObjects = Array.isArray(templateData.objects) ? templateData.objects : [];
    
    if (sourceObjects.length === 0) {
      console.warn("[TemplateLoader] Template has no objects.");
    }

    // 2. Generate fresh IDs and maintain hierarchy
    // We deep clone first to avoid mutating source data
    const clonedObjects = JSON.parse(JSON.stringify(sourceObjects));
    const idMap = new Map<string, string>();

    // Pass 1: Register all existing IDs and generate new ones
    clonedObjects.forEach((obj: any) => {
      const oldId = obj.id || `temp-${Math.random().toString(36).substring(7)}`;
      const newId = Math.random().toString(36).substring(7);
      idMap.set(oldId, newId);
    });

    // Pass 2: Apply new IDs and map parentIds
    const finalObjects: CanvasObject[] = clonedObjects.map((obj: any) => {
      const oldId = obj.id;
      const newId = idMap.get(oldId) || Math.random().toString(36).substring(7);
      
      const newObj = {
        ...obj,
        id: newId,
      };

      if (obj.parentId && idMap.has(obj.parentId)) {
        newObj.parentId = idMap.get(obj.parentId);
      }

      return newObj as CanvasObject;
    });

    // 3. Extract presentation path (frames)
    const presentationPath = finalObjects
      .filter(obj => obj.type === 'frame')
      .map(obj => obj.id);

    // 4. Calculate viewport (Center & Zoom to fit)
    // Default fallback if no objects
    let viewport = { x: 0, y: 0, zoom: 1 };

    if (finalObjects.length > 0) {
      const bounds = finalObjects.reduce(
        (acc, obj) => ({
          minX: Math.min(acc.minX, obj.x),
          minY: Math.min(acc.minY, obj.y),
          maxX: Math.max(acc.maxX, obj.x + obj.width),
          maxY: Math.max(acc.maxY, obj.y + obj.height),
        }),
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );

      const padding = 100;
      const contentWidth = bounds.maxX - bounds.minX;
      const contentHeight = bounds.maxY - bounds.minY;
      
      // Target viewport size (approximate editor area)
      const targetWidth = 1200; 
      const targetHeight = 800;

      const zoomX = targetWidth / (contentWidth + padding * 2);
      const zoomY = targetHeight / (contentHeight + padding * 2);
      const zoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.1), 2); // Clamp between 0.1 and 2

      // Center the content
      viewport = {
        x: -(bounds.minX + contentWidth / 2) * zoom + targetWidth / 2,
        y: -(bounds.minY + contentHeight / 2) * zoom + targetHeight / 2,
        zoom
      };
    } else {
      viewport = { x: 100, y: 100, zoom: 0.8 };
    }

    console.log("[TemplateLoader] Process complete.", {
      objectCount: finalObjects.length,
      frames: presentationPath.length,
      viewport
    });

    return {
      objects: finalObjects,
      viewport,
      presentationPath
    };
  }
}
