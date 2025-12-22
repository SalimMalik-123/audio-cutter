# Audio Cutter - Professional Browser-Based Audio Editor

A fully client-side audio editing application built with React, TypeScript, and WaveSurfer.js. Cut, trim, and export audio clips directly in your browser with complete privacy.

## Features

### Core Functionality
- **Multiple Audio Format Support**: MP3, WAV, M4A, OGG, FLAC
- **High-Quality Waveform Visualization**: Clear, interactive waveform display
- **Multiple Cut Regions**: Place unlimited cut regions on the same waveform
- **Precise Editing**: Millisecond-accurate trimming and cutting

### Editing Capabilities
- **Add/Remove Regions**: Easily create and delete cut regions
- **Drag & Resize**: Move regions and adjust their boundaries intuitively
- **Undo/Redo**: Full history support for all editing actions
- **Visual Feedback**: Selected regions are highlighted with clear borders

### Zoom & Navigation
- **Zoom In/Out**: Dedicated buttons for desktop users
- **Mouse Wheel Zoom**: Quick zoom using scroll wheel (desktop)
- **Pinch-to-Zoom**: Native pinch gesture support on mobile devices
- **Horizontal Scrolling**: Swipe to navigate through long audio files

### Export Options
- **Single Export**: Export individual selected regions
- **Batch Export**: Download all regions as a ZIP file
- **Auto-Naming**: Clips are automatically named (clip_01.wav, clip_02.wav, etc.)
- **Quality Preservation**: Maintains original audio quality

### Mobile-First Design
- **Large Touch Targets**: 56px minimum height buttons for easy tapping
- **Sticky Toolbar**: Always-accessible bottom toolbar with key actions
- **Touch Gestures**: Optimized for mobile touch interactions
- **Responsive Layout**: Works seamlessly on phones, tablets, and desktops

### Privacy & Performance
- **100% Client-Side**: All processing happens in your browser
- **No Uploads**: Your files never leave your device
- **No Backend**: No servers, no data storage, complete privacy
- **Optimized Performance**: Handles large audio files efficiently

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Waveform Rendering**: WaveSurfer.js with Regions plugin
- **Audio Processing**: Web Audio API
- **Export**: JSZip for batch downloads
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React

## How It Works

### Waveform Rendering
The app uses WaveSurfer.js to decode and visualize audio files. The waveform is rendered as an interactive canvas that users can zoom and scroll through.

### Zoom & Scrolling
- **Zoom levels**: Range from 10x to 300x magnification
- **Desktop**: Use zoom buttons or mouse wheel for quick adjustments
- **Mobile**: Pinch gestures are supported through the browser's native touch handling
- **Horizontal scroll**: The waveform container has `overflow-x-auto` with `touch-pan-x` for smooth mobile scrolling

### Multi-Region Cutting
Regions are managed using WaveSurfer's Regions plugin:
1. Each region has a unique ID, start time, and end time
2. Regions can be dragged to move them along the timeline
3. Region edges can be resized by dragging the handles
4. Multiple regions can exist simultaneously on the same waveform
5. Clicking a region selects it (shown with a dark border)

### Audio Export
The export process uses the Web Audio API:
1. Extract the selected time range from the audio buffer
2. Create an offline audio context matching the original specs
3. Render the selected portion
4. Convert to WAV format using manual binary encoding
5. Create a downloadable Blob

For batch exports:
1. Sort regions by start time
2. Export each region individually
3. Add all clips to a ZIP file using JSZip
4. Download the complete archive

### Undo/Redo
- Every region operation (add, move, resize, delete) is saved to history
- History is stored as an array of states with timestamps
- Undo/Redo reconstructs the exact region configuration
- Maximum history depth is unlimited (limited only by browser memory)

## Usage

1. **Upload Audio**: Click or drag-and-drop an audio file
2. **Add Regions**: Click "Add Cut" to create a new region at the current playback position
3. **Edit Regions**: Drag to move, drag edges to resize
4. **Select Region**: Click on a region to select it
5. **Delete Region**: Select a region and click "Delete Cut"
6. **Export**: Use "Export Selected" for one clip or "Export All (ZIP)" for batch download
7. **Zoom**: Use zoom buttons to see more detail or get an overview
8. **Undo/Redo**: Step backward/forward through your editing history

## Mobile Considerations

- All buttons have minimum 56px height for easy tapping
- The toolbar is sticky at the bottom for thumb-friendly access
- Waveform scrolling uses momentum scrolling on mobile
- Pinch gestures zoom the waveform naturally
- Region handles are large enough for precise touch manipulation
- The interface adapts to smaller screens with responsive breakpoints

## Browser Compatibility

Works in all modern browsers that support:
- Web Audio API
- HTML5 File API
- ES6+ JavaScript features

Tested on:
- Chrome/Edge (desktop & mobile)
- Safari (desktop & mobile)
- Firefox (desktop & mobile)

## Future Enhancements

Potential features for future versions:
- Dark/light mode toggle
- Keyboard shortcuts for desktop users
- PWA support for offline use
- Silence detection to auto-create regions
- Multiple export formats (MP3, OGG, FLAC)
- Custom region labels/markers
- Fade in/out effects
- Playback speed control
- Grid snapping for precise alignment

## License

MIT License - Feel free to use and modify for your projects.
