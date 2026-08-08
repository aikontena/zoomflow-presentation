import { CanvasObject, Bookmark } from './canvas-store';

/**
 * Mocks the logic for converting PPTX/PDF to our internal canvas format.
 * In a real-world scenario, this would use a library like pptxgenjs or pdf.js on the client,
 * or a server function with an OCR/parsing library.
 */
export class SlideImporter {
  /**
   * Processes a file and returns a document structure compatible with useCanvasStore.loadDocument
   */
  static async importFile(file: File): Promise<{
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

    // Artificial delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock object generation
    const objects: CanvasObject[] = [];
    const presentationPath: string[] = [];
    const bookmarks: Bookmark[] = [];
    
    // Create a background
    const bgId = Math.random().toString(36).substring(7);
    objects.push({
      id: bgId,
      type: 'rectangle',
      x: -2500,
      y: -2500,
      width: 10000,
      height: 10000,
      rotation: 0,
      fill: isPDF ? '#f0f0f0' : '#ffffff',
      locked: true,
      opacity: 1
    });

    // Create 5 slides in a spatial layout
    const slideCount = 5;
    const spacing = 1200;

    for (let i = 0; i < slideCount; i++) {
      const frameId = `frame-${i}-${Math.random().toString(36).substring(7)}`;
      const x = i * spacing;
      const y = (i % 2 === 0 ? 0 : 400);
      
      // The Frame
      objects.push({
        id: frameId,
        type: 'frame',
        x,
        y,
        width: 800,
        height: 450,
        rotation: i * 5, // Slight rotation for spatial effect
        fill: '#ffffff',
        text: `${isPPT ? 'Slide' : 'Page'} ${i + 1}`,
        shadow: true,
        settings: {
          duration: 1200,
          easing: 'smooth',
          camera: { x: -x + 200, y: -y + 200, zoom: 0.8, rotation: -(i * 5) }
        }
      });

      // Slide Content Mockup
      objects.push({
        id: Math.random().toString(36).substring(7),
        type: 'text',
        x: x + 50,
        y: y + 50,
        width: 700,
        height: 60,
        rotation: i * 5,
        fill: '#1a1a1a',
        fontSize: 32,
        text: `${isPPT ? 'PPTX' : 'PDF'} Imported Content - ${i + 1}`,
        parentId: frameId
      });

      objects.push({
        id: Math.random().toString(36).substring(7),
        type: 'text',
        x: x + 50,
        y: y + 150,
        width: 700,
        height: 150,
        rotation: i * 5,
        fill: '#666666',
        fontSize: 18,
        text: 'This is a simulated conversion of your document. In a production environment, this would extract text, images, and shapes from your ' + (isPPT ? 'PowerPoint slides' : 'PDF pages') + ' and arrange them spatially on the ZoomCanvas.',
        parentId: frameId
      });

      presentationPath.push(frameId);
      bookmarks.push({
        id: `bm-${frameId}`,
        label: `${isPPT ? 'Slide' : 'Page'} ${i + 1}`,
        viewport: { x: -x + 200, y: -y + 200, zoom: 0.8, rotation: -(i * 5) }
      });
    }

    return {
      objects,
      viewport: { x: 200, y: 200, zoom: 0.5, rotation: 0 },
      presentationPath,
      bookmarks
    };
  }
}
