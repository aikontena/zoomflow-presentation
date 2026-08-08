import { CanvasObject, Bookmark } from './canvas-store';
// @ts-ignore
import pptx2json from 'pptx2json';
import * as pdfjs from 'pdfjs-dist';
// @ts-ignore
import jszip from 'jszip';

// Set worker source for pdfjs-dist using a version-matched CDN
const PDFJS_VERSION = '4.0.379';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

export class SlideImporter {
  static async importFile(
    file: File, 
    mode: 'preserve' | 'convert' | 'ai' = 'preserve'
  ): Promise<{
    objects: CanvasObject[];
    viewport: { x: number; y: number; zoom: number; rotation?: number };
    presentationPath: string[];
    bookmarks?: Bookmark[];
  }> {
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isPPT = file.type.includes('presentation') || file.name.toLowerCase().endsWith('.pptx');

    if (!isPDF && !isPPT) {
      throw new Error('Unsupported file format. Please upload a PDF or PPTX file.');
    }

    if (isPDF) {
      return this.importPDF(file, mode);
    } else {
      return this.importPPT(file, mode);
    }
  }

  private static async importPDF(file: File, mode: 'preserve' | 'convert' | 'ai'): Promise<any> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (pdfjs as any).getDocument({ data: arrayBuffer }).promise;
    
    const objects: CanvasObject[] = [];
    const presentationPath: string[] = [];
    const bookmarks: Bookmark[] = [];
    
    const slideWidth = 1280;
    const slideHeight = 720; // Standard 16:9
    const spacing = mode === 'preserve' ? 1400 : 1800;

    // Canvas Background Object (locked)
    objects.push({
      id: 'import-bg-' + Math.random().toString(36).substring(7),
      type: 'rectangle',
      x: -5000,
      y: -5000,
      width: 20000,
      height: 20000,
      rotation: 0,
      fill: '#fcfcfc',
      locked: true,
      opacity: 1
    });

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      // Render at high scale for "visually identical" requirement
      const scale = 2.5; 
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context!, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/png');

      // Spatial Positioning Logic
      let x = (i - 1) * spacing;
      let y = 0;
      let rotation = 0;

      if (mode === 'ai') {
        // Spatial Galaxy Layout for AI mode
        const angle = (i - 1) * 0.4;
        const radius = (i - 1) * 1000;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        rotation = angle * (180 / Math.PI) + 90;
      } else if (mode === 'convert') {
        // Grid layout for conversion
        const cols = 4;
        x = ((i - 1) % cols) * spacing;
        y = Math.floor((i - 1) / cols) * (slideHeight + 400);
      }

      const frameId = `pdf-frame-${i}-${Math.random().toString(36).substring(7)}`;

      // 1. The Container Frame
      objects.push({
        id: frameId,
        type: 'frame',
        x,
        y,
        width: slideWidth,
        height: slideHeight,
        rotation,
        fill: '#ffffff',
        text: `Slide ${i}`,
        shadow: true,
        settings: {
          duration: mode === 'preserve' ? 800 : 1500,
          easing: mode === 'ai' ? 'cinematic' : 'smooth',
          camera: { 
            x: -x + (slideWidth * 0.1), 
            y: -y + (slideHeight * 0.1), 
            zoom: 0.5, 
            rotation: -rotation 
          }
        }
      });

      // 2. The Original Document Layer (High-Fidelity)
      objects.push({
        id: `pdf-content-${i}`,
        type: 'image',
        x,
        y,
        width: slideWidth,
        height: slideHeight,
        rotation,
        fill: 'transparent',
        src: dataUrl,
        parentId: frameId,
        locked: mode === 'preserve' // In preserve mode, background is locked
      });

      // In 'convert' mode, we could attempt to parse text layers here, 
      // but to fulfill the "identical" requirement, we keep the image as a reference layer.

      presentationPath.push(frameId);
      bookmarks.push({
        id: `bm-${frameId}`,
        label: `Slide ${i}`,
        viewport: { 
          x: -x + (slideWidth * 0.1), 
          y: -y + (slideHeight * 0.1), 
          zoom: 0.5, 
          rotation: -rotation 
        }
      });
    }

    return {
      objects,
      viewport: { x: slideWidth/2, y: slideHeight/2, zoom: 0.2, rotation: 0 },
      presentationPath,
      bookmarks
    };
  }

  private static async importPPT(file: File, mode: 'preserve' | 'convert' | 'ai'): Promise<any> {
    const arrayBuffer = await file.arrayBuffer();
    const pptx = new pptx2json();
    const json = await pptx.toJson(arrayBuffer);
    
    const objects: CanvasObject[] = [];
    const presentationPath: string[] = [];
    const bookmarks: Bookmark[] = [];
    
    const slideWidth = 1280;
    const slideHeight = 720;
    const spacing = mode === 'preserve' ? 1400 : 1800;

    // Seed Background
    objects.push({
      id: 'pptx-bg-' + Math.random().toString(36).substring(7),
      type: 'rectangle',
      x: -10000,
      y: -10000,
      width: 30000,
      height: 30000,
      rotation: 0,
      fill: '#f8f8f8',
      locked: true,
      opacity: 1
    });

    const slides = json.slides || [];
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      let x = i * spacing;
      let y = 0;
      let rotation = 0;

      if (mode === 'ai') {
        const angle = i * 0.5;
        const radius = i * 1100;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        rotation = angle * (180 / Math.PI);
      } else if (mode === 'convert') {
        const cols = 3;
        x = (i % cols) * spacing;
        y = Math.floor(i / cols) * (slideHeight + 400);
      }

      const frameId = `pptx-frame-${i}-${Math.random().toString(36).substring(7)}`;

      // 1. Frame Container
      objects.push({
        id: frameId,
        type: 'frame',
        x,
        y,
        width: slideWidth,
        height: slideHeight,
        rotation,
        fill: '#ffffff',
        text: slide.title || `Slide ${i + 1}`,
        shadow: true,
        settings: {
          duration: 1000,
          easing: mode === 'ai' ? 'cinematic' : 'smooth',
          camera: { 
            x: -x + (slideWidth * 0.1), 
            y: -y + (slideHeight * 0.1), 
            zoom: 0.5, 
            rotation: -rotation 
          }
        }
      });

      // 2. Extract Content (Text and Images)
      const elements = slide.elements || [];
      elements.forEach((el: any, index: number) => {
        const elId = `${frameId}-el-${index}`;
        
        // Basic mapping of PPTX coordinates to our canvas
        // pptx2json usually gives percentages or EMU, we simplify to relative layout
        const elWidth = (el.width / 100) * slideWidth || 300;
        const elHeight = (el.height / 100) * slideHeight || 100;
        const elX = x + ((el.x / 100) * slideWidth || 50);
        const elY = y + ((el.y / 100) * slideHeight || 50);

        if (el.type === 'text') {
          objects.push({
            id: elId,
            type: 'text',
            x: elX,
            y: elY,
            width: elWidth,
            height: elHeight,
            rotation: rotation + (el.rotation || 0),
            fill: el.color || '#000000',
            fontSize: el.fontSize || 24,
            text: el.text || '',
            parentId: frameId,
            locked: mode === 'preserve'
          });
        } else if (el.type === 'image') {
          objects.push({
            id: elId,
            type: 'image',
            x: elX,
            y: elY,
            width: elWidth,
            height: elHeight,
            rotation: rotation + (el.rotation || 0),
            src: el.src, // Base64 usually
            parentId: frameId,
            locked: mode === 'preserve'
          });
        }
      });

      presentationPath.push(frameId);
      bookmarks.push({
        id: `bm-${frameId}`,
        label: slide.title || `Slide ${i + 1}`,
        viewport: { 
          x: -x + (slideWidth * 0.1), 
          y: -y + (slideHeight * 0.1), 
          zoom: 0.5, 
          rotation: -rotation 
        }
      });
    }

    return {
      objects,
      viewport: { x: slideWidth/2, y: slideHeight/2, zoom: 0.2, rotation: 0 },
      presentationPath,
      bookmarks
    };
  }
}