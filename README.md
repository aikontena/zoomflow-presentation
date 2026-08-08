# Remix of Canvas Flow AI

# ZoomCanvas AI - Master Prompt (Phase 1)



Build a modern SaaS web application called **ZoomCanvas AI**.



## Objective



Create an AI-powered presentation platform inspired by Prezi, but with a modern interface and intelligent AI features.



The application should allow users to create presentations on an infinite canvas instead of traditional slides.



The application must be production-ready with responsive UI, authentication, database integration and scalable architecture.



---



## Tech Stack



- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- Supabase

- React Router

- Zustand

- Framer Motion

- React Flow (or tldraw for infinite canvas)

- Lucide Icons



---



## Authentication



Use Supabase Authentication.



Support:



- Email Login

- Google Login

- Forgot Password

- User Profile



---



## Dashboard



After login display:



My Presentations



Recent Projects



Templates



Create New Presentation



Trash



Settings



Search Bar



Dark / Light Mode



---



## Database



Supabase Tables



profiles



presentations



presentation_pages



canvas_objects



presentation_paths



templates



folders



shared_users



activity_logs



---



## Presentation Editor



Create an infinite canvas.



Features



Pan



Zoom



Mouse wheel zoom



Touch zoom



Mini map



Grid background



Snap to Grid



Undo



Redo



Auto Save



---



## Objects



Users can insert



Text



Heading



Rectangle



Circle



Arrow



Image



Icon



Video



PDF



Sticky Note



Code Block



Table



Chart Placeholder



Every object must support



Move



Resize



Rotate



Duplicate



Delete



Bring Forward



Send Backward



Lock



Unlock



Opacity



Color



Shadow



Border Radius



Animation



---



## Left Sidebar



Pages



Assets



Uploads



Icons



Templates



AI Assistant



---



## Right Sidebar



Properties



Typography



Position



Fill



Stroke



Shadow



Animation



Interaction



Layer



---



## Top Toolbar



Save



Undo



Redo



Present



Export



Share



History



Settings



---



## Presentation Mode



Full screen



Smooth zoom animation



Animated transitions



Keyboard navigation



Click navigation



Autoplay



Presenter Mode



Laser Pointer



Timer



Speaker Notes Panel



---



## Templates



Business



Education



Research



Pitch Deck



Mind Map



Infographic



Timeline



Marketing



Training



Academic



---



## Search



Global search



Presentation search



Object search



---



## Responsive



Desktop



Tablet



Mobile



---



## Performance



Lazy Loading



Code Splitting



Image Optimization



Virtual Rendering



Auto Save every 10 seconds



---



## UI Design



Apple inspired



Glassmorphism



Rounded corners



Minimal



Smooth animation



Professional typography



Clean spacing



Modern dashboard



No clutter



---



## Security



Supabase RLS



Secure Storage



Role-based permissions



Activity Logs



---



## Future Ready



Structure the code to allow future AI integration without major refactoring.



Every feature must use reusable React components.



Follow best practices and clean architecture.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://zoomflow-presentation.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/48da3149-3c3e-458d-984d-2caedde9a7da).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
