import { useEffect, useRef, useState, useCallback } from "react";
import Peaks, { PeaksInstance } from "peaks.js";
import { AudioRegion, HistoryState } from "../types";
import { generateRandomColor } from "../utils/audioProcessor";
import {
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  Download,
  Undo2,
  Redo2,
  Play,
  Pause,
} from "lucide-react";

interface WaveformEditorProps {
  audioFile: File;
  onAudioBufferReady: (buffer: AudioBuffer) => void;
  onRegionsChange: (regions: AudioRegion[]) => void;
}

export const WaveformEditor = ({
  audioFile,
  onAudioBufferReady,
  onRegionsChange,
}: WaveformEditorProps) => {
  const overviewContainerRef = useRef<HTMLDivElement>(null);
  const zoomviewContainerRef = useRef<HTMLDivElement>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const peaksInstanceRef = useRef<PeaksInstance | null>(null);

  const [zoom, setZoom] = useState(512); // Peaks.js uses samples per pixel
  const [regions, setRegions] = useState<AudioRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  const saveToHistory = useCallback(
    (newRegions: AudioRegion[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        regions: JSON.parse(JSON.stringify(newRegions)),
        timestamp: Date.now(),
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Initialize Peaks.js
  useEffect(() => {
    if (
      !overviewContainerRef.current ||
      !zoomviewContainerRef.current ||
      !audioElementRef.current ||
      !audioFile
    ) {
      return;
    }

    setIsLoading(true);
    let isCleanedUp = false;

    // Create object URL for audio file
    const audioUrl = URL.createObjectURL(audioFile);
    audioElementRef.current.src = audioUrl;

    const options = {
      overview: {
        container: overviewContainerRef.current,
        waveformColor: "#4f46e5",
        highlightColor: "#818cf8",
      },
      zoomview: {
        container: zoomviewContainerRef.current,
        waveformColor: "#4f46e5",
      },
      mediaElement: audioElementRef.current,
      webAudio: {
        audioContext: new AudioContext(),
      },
      zoomLevels: [128, 256, 512, 1024, 2048, 4096],
      keyboard: false,
      pointMarkerColor: "#1e1b4b",
      playheadColor: "#1e1b4b",
      playheadTextColor: "#1e1b4b",
      segmentOptions: {
        overlay: true,
        startMarkerColor: "#4f46e5",
        endMarkerColor: "#4f46e5",
      },
    };

    Peaks.init(options, (err, peaks) => {
      if (err || !peaks || isCleanedUp) {
        console.error("Failed to initialize Peaks.js:", err);
        setIsLoading(false);
        if (err) {
          alert("Error loading audio file. Please try a different file.");
        }
        return;
      }

      peaksInstanceRef.current = peaks;
      console.log("Peaks.js initialized successfully");

      // Get audio buffer for compatibility with existing code
      if (options.webAudio?.audioContext && audioElementRef.current) {
        const audioContext = options.webAudio.audioContext;
        fetch(audioUrl)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
          .then((audioBuffer) => {
            if (!isCleanedUp) {
              onAudioBufferReady(audioBuffer);
            }
          })
          .catch((error) => {
            console.error("Error decoding audio:", error);
          });
      }

      setIsLoading(false);

      // Set up event listeners
      peaks.on("segments.add", (segment: any) => {
        if (isCleanedUp) return;
        setRegions((prev) => {
          const newRegions = [
            ...prev,
            {
              id: segment.id,
              start: segment.startTime,
              end: segment.endTime,
              color: segment.color,
            },
          ];
          return newRegions;
        });
      });

      peaks.on("segments.dragend", (segment: any) => {
        if (isCleanedUp) return;
        setRegions((prev) => {
          const newRegions = prev.map((r) =>
            r.id === segment.id
              ? { ...r, start: segment.startTime, end: segment.endTime }
              : r
          );
          return newRegions;
        });
      });

      peaks.on("segments.click", (segment: any) => {
        if (isCleanedUp) return;
        setSelectedRegion(segment.id);
      });

      // Audio element event listeners
      const handlePlay = () => {
        if (!isCleanedUp) setIsPlaying(true);
      };

      const handlePause = () => {
        if (!isCleanedUp) setIsPlaying(false);
      };

      const audioElement = audioElementRef.current;
      audioElement?.addEventListener("play", handlePlay);
      audioElement?.addEventListener("pause", handlePause);

      // Cleanup function
      return () => {
        isCleanedUp = true;
        audioElement?.removeEventListener("play", handlePlay);
        audioElement?.removeEventListener("pause", handlePause);
        URL.revokeObjectURL(audioUrl);
        peaks.destroy();
      };
    });

    return () => {
      isCleanedUp = true;
      URL.revokeObjectURL(audioUrl);
      if (peaksInstanceRef.current) {
        peaksInstanceRef.current.destroy();
      }
    };
  }, [audioFile]);

  // Handle zoom changes
  useEffect(() => {
    if (peaksInstanceRef.current && zoom) {
      peaksInstanceRef.current.zoom.setZoom(zoom);
    }
  }, [zoom]);

  // Save to history whenever regions change (skip initial empty state)
  useEffect(() => {
    if (regions.length > 0 || historyIndex >= 0) {
      saveToHistory(regions);
    }
  }, [regions]);

  useEffect(() => {
    onRegionsChange(regions);
  }, [regions, onRegionsChange]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.max(prev / 2, 128)); // Decrease samples per pixel = zoom in
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.min(prev * 2, 4096)); // Increase samples per pixel = zoom out
  };

  const handleAddRegion = () => {
    if (!peaksInstanceRef.current || !audioElementRef.current) return;

    const currentTime = audioElementRef.current.currentTime;
    const duration = audioElementRef.current.duration;
    const start = Math.min(currentTime, duration - 2);
    const end = Math.min(start + 2, duration);

    peaksInstanceRef.current.segments.add({
      startTime: start,
      endTime: end,
      color: generateRandomColor(),
      editable: true,
    });
  };

  const handleDeleteRegion = () => {
    if (!selectedRegion || !peaksInstanceRef.current) return;

    peaksInstanceRef.current.segments.removeById(selectedRegion);
    setRegions((prev) => {
      const newRegions = prev.filter((r) => r.id !== selectedRegion);
      saveToHistory(newRegions);
      return newRegions;
    });
    setSelectedRegion(null);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      restoreState(state);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      restoreState(state);
      setHistoryIndex(newIndex);
    }
  };

  const restoreState = (state: HistoryState) => {
    if (!peaksInstanceRef.current) return;

    peaksInstanceRef.current.segments.removeAll();

    state.regions.forEach((region) => {
      peaksInstanceRef.current!.segments.add({
        id: region.id,
        startTime: region.start,
        endTime: region.end,
        color: region.color || generateRandomColor(),
        editable: true,
      });
    });

    setRegions(state.regions);
  };

  const handlePlayPause = () => {
    if (peaksInstanceRef.current) {
      if (isPlaying) {
        peaksInstanceRef.current.player.pause();
      } else {
        peaksInstanceRef.current.player.play();
      }
    }
  };

  const handleExportRegion = () => {
    if (selectedRegion && regions.length > 0) {
      window.dispatchEvent(
        new CustomEvent("export-region", { detail: selectedRegion })
      );
    }
  };

  const handleExportAll = () => {
    if (regions.length > 0) {
      window.dispatchEvent(new CustomEvent("export-all-regions"));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleZoomOut}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors touch-manipulation"
              aria-label="Zoom out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors touch-manipulation"
              aria-label="Zoom in"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation"
              aria-label="Undo"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation"
              aria-label="Redo"
            >
              <Redo2 size={20} />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Zoom: {zoom} spp | Regions: {regions.length}
          </div>
        </div>

        {isLoading && (
          <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-600">Loading audio file...</p>
            </div>
          </div>
        )}

        {/* Hidden audio element */}
        <audio ref={audioElementRef} style={{ display: "none" }} />

        {/* Overview waveform */}
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1 font-medium">Overview</div>
          <div
            ref={overviewContainerRef}
            className="w-full h-20 rounded-lg bg-gray-50 border border-gray-200"
          />
        </div>

        {/* Zoomable waveform */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1 font-medium">Waveform</div>
          <div
            ref={zoomviewContainerRef}
            className="w-full h-48 overflow-x-auto rounded-lg bg-gray-50 border border-gray-200"
          />
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause size={20} />
                Pause
              </>
            ) : (
              <>
                <Play size={20} />
                Play
              </>
            )}
          </button>
          <div className="text-sm text-gray-600">
            {selectedRegion
              ? `Selected: ${selectedRegion}`
              : "No region selected"}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 z-10">
        <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
          <button
            onClick={handleAddRegion}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg touch-manipulation min-h-[56px]"
          >
            <Plus size={24} />
            Add Cut
          </button>
          <button
            onClick={handleDeleteRegion}
            disabled={!selectedRegion}
            className="flex items-center gap-2 px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg touch-manipulation min-h-[56px]"
          >
            <Trash2 size={24} />
            Delete Cut
          </button>
          <button
            onClick={handleExportRegion}
            disabled={!selectedRegion}
            className="flex items-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg touch-manipulation min-h-[56px]"
          >
            <Download size={24} />
            Export Selected
          </button>
          <button
            onClick={handleExportAll}
            disabled={regions.length === 0}
            className="flex items-center gap-2 px-6 py-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 active:bg-cyan-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg touch-manipulation min-h-[56px]"
          >
            <Download size={24} />
            Export All (ZIP)
          </button>
        </div>
      </div>
    </div>
  );
};
