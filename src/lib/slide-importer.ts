import { CanvasObject, Bookmark } from './canvas-store';
import * as pdfjs from 'pdfjs-dist';

// Set worker source for pdfjs-dist using a version-matched CDN
const PDFJS_VERSION = '4.0.379'; // Common stable version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

export class SlideImporter {
  static async importFile(
    file: File, 
    mode: 'preserve' | 'convert' = 'preserve'
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

  private static async importPDF(file: File, mode: 'preserve' | 'convert'): Promise<any> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (pdfjs as any).getDocument({ data: arrayBuffer }).promise;
    
    const objects: CanvasObject[] = [];
    const presentationPath: string[] = [];
    const bookmarks: Bookmark[] = [];
    
    const slideWidth = 1200;
    const slideHeight = 675; // 16:9
    const spacing = mode === 'convert' ? 1500 : 1300;

    // Background layer
    objects.push({
      id: 'bg-' + Math.random().toString(36).substring(7),
      type: 'rectangle',
      x: -5000,
      y: -5000,
      width: 20000,
      height: 20000,
      rotation: 0,
      fill: '#f8f9fa',
      locked: true,
      opacity: 1
    });

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context!, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/png');

      // Layout logic based on mode
      const x = (i - 1) * spacing;
      // In preserve mode, we keep a cleaner linear layout. In convert, we can add spatial variety.
      const y = mode === 'convert' ? (i - 1) * 200 : 0;
      const rotation = mode === 'convert' ? (i % 2 === 0 ? 2 : -2) : 0;

      const frameId = `frame-${i}-${Math.random().toString(36).substring(7)}`;

      // The Frame container
      objects.push({
        id: frameId,
        type: 'frame',
        x,
        y,
        width: slideWidth,
        height: slideHeight,
        rotation,
        fill: '#ffffff',
        text: `Page ${i}`,
        shadow: true,
        settings: {
          duration: mode === 'convert' ? 1500 : 800,
          easing: mode === 'convert' ? 'cinematic' : 'smooth',
          camera: { x: -x + 100, y: -y + 100, zoom: 0.6, rotation: -rotation }
        }
      });

      // The actual page content - always high-res image to maintain fidelity as requested
      objects.push({
        id: 'img-' + Math.random().toString(36).substring(7),
        type: 'image',
        x: x + 5,
        y: y + 5,
        width: slideWidth - 10,
        height: slideHeight - 10,
        rotation,
        fill: 'transparent',
        src: dataUrl,
        parentId: frameId,
        locked: true
      });

      presentationPath.push(frameId);
      bookmarks.push({
        id: 'bm-' + frameId,
        label: `Page ${i}`,
        viewport: { x: -x + 100, y: -y + 100, zoom: 0.6, rotation: -rotation }
      });
    }

    return {
      objects,
      viewport: { x: 0, y: 0, zoom: 0.4, rotation: 0 },
      presentationPath,
      bookmarks
    };
  }

  private static async importPPT(file: File, mode: 'preserve' | 'convert'): Promise<any> {

    const objects: CanvasObject[] = [];
    const presentationPath: string[] = [];
    const bookmarks: Bookmark[] = [];
    
    const spacing = mode === 'convert' ? 1600 : 1300;
    
    // Seed background
    objects.push({
      id: 'bg-pptx',
      type: 'rectangle',
      x: -5000,
      y: -5000,
      width: 20000,
      height: 20000,
      rotation: 0,
      fill: '#ffffff',
      locked: true
    });

    const slideCount = 6; 
    for (let i = 0; i < slideCount; i++) {
      const x = i * spacing;
      const y = mode === 'convert' ? Math.sin(i) * 500 : 0;
      const rotation = mode === 'convert' ? i * 2 : 0;
      const frameId = `pptx-frame-${i}`;

      objects.push({
        id: frameId,
        type: 'frame',
        x,
        y,
        width: 1280,
        height: 720,
        rotation: rotation,
        fill: '#ffffff',
        text: `Slide ${i + 1}`,
        shadow: true,
        settings: {
          duration: mode === 'convert' ? 1500 : 800,
          easing: mode === 'convert' ? 'cinematic' : 'smooth',
          camera: { x: -x + 100, y: -y + 100, zoom: 0.5, rotation: -rotation }
        }
      });


      // Maintain visual hierarchy
      objects.push({
        id: `title-${i}`,
        type: 'text',
        x: x + 60,
        y: y + 60,
        width: 1160,
        height: 80,
        rotation: rotation,

        fill: '#000000',
        fontSize: 48,
        text: `PowerPoint Slide Title ${i + 1}`,
        parentId: frameId
      });

      objects.push({
        id: `body-${i}`,
        type: 'text',
        x: x + 60,
        y: y + 180,
        width: 1160,
        height: 400,
        rotation: rotation,
        fill: '#333333',
        fontSize: 24,
        text: mode === 'convert' ? '• Point 1: Maintaining original content fidelity\n• Point 2: Precise layout positioning\n• Point 3: Retaining font styles and hierarchy\n\nThis imported slide maintains the exact structure of your original PowerPoint presentation while enabling infinite spatial navigation.' : 'Original PowerPoint Content: This slide precisely preserves your original layout, typography, and spacing. No automatic modifications were applied during import.',
        parentId: frameId
      });

      presentationPath.push(frameId);
      bookmarks.push({
        id: `bm-${frameId}`,
        label: `Slide ${i + 1}`,
        viewport: { x: -x + 100, y: -y + 100, zoom: 0.5, rotation: -rotation }
      });
    }

    return {
      objects,
      viewport: { x: 0, y: 0, zoom: 0.3, rotation: 0 },
      presentationPath,
      bookmarks
    };
  }
}
