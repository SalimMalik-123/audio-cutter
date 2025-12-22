import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
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
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);

  const [zoom, setZoom] = useState(50);
  const [regions, setRegions] = useState<AudioRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [containerReady, setContainerReady] = useState(false);

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

  // Set container ready when ref is available
  useEffect(() => {
    if (!waveformRef.current || !audioFile) return;

    setIsLoading(true);
    let destroyed = false;

    const regionsPlugin = RegionsPlugin.create();
    regionsPluginRef.current = regionsPlugin;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#4f46e5",
      progressColor: "#818cf8",
      cursorColor: "#1e1b4b",
      height: 200,
      normalize: true,
      plugins: [regionsPlugin],
    });

    wavesurferRef.current = wavesurfer;

    const audioUrl = URL.createObjectURL(audioFile);

    wavesurfer.on("ready", () => {
      if (destroyed) return;
      setIsLoading(false);

      const buffer = wavesurfer.getDecodedData();
      if (buffer) onAudioBufferReady(buffer);
    });

    wavesurfer.on("error", (err) => {
      console.error("WaveSurfer error:", err);
      setIsLoading(false);
    });

    wavesurfer.load(audioUrl);

    return () => {
      destroyed = true;
      URL.revokeObjectURL(audioUrl);
      wavesurfer.destroy();
    };
  }, [audioFile]);

  useEffect(() => {
    if (!waveformRef.current || !containerReady) {
      console.log("Container not ready yet", {
        hasRef: !!waveformRef.current,
        containerReady,
      });
      return;
    }

    let isCleanedUp = false;
    setIsLoading(true);
    console.log("Initializing WaveSurfer for file:", audioFile.name);

    const regionsPlugin = RegionsPlugin.create();
    regionsPluginRef.current = regionsPlugin;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#4f46e5",
      progressColor: "#818cf8",
      cursorColor: "#1e1b4b",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 200,
      normalize: true,
      plugins: [regionsPlugin],
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on("ready", () => {
      if (isCleanedUp) return;
      console.log("Audio loaded successfully");
      setIsLoading(false);
      const buffer = wavesurfer.getDecodedData();
      if (buffer) {
        onAudioBufferReady(buffer);
      }
    });

    wavesurfer.on("error", (error) => {
      if (isCleanedUp) return;
      console.error("WaveSurfer error:", error);
      setIsLoading(false);
      alert("Error loading audio file. Please try a different file.");
    });

    wavesurfer.on("play", () => {
      if (isCleanedUp) return;
      setIsPlaying(true);
    });

    wavesurfer.on("pause", () => {
      if (isCleanedUp) return;
      setIsPlaying(false);
    });

    regionsPlugin.on("region-created", (region) => {
      if (isCleanedUp) return;
      setRegions((prev) => {
        const newRegions = [
          ...prev,
          {
            id: region.id,
            start: region.start,
            end: region.end,
            color: region.color,
          },
        ];
        return newRegions;
      });
    });

    regionsPlugin.on("region-updated", (region) => {
      if (isCleanedUp) return;
      setRegions((prev) => {
        const newRegions = prev.map((r) =>
          r.id === region.id
            ? { ...r, start: region.start, end: region.end }
            : r
        );
        return newRegions;
      });
    });

    regionsPlugin.on("region-clicked", (region, e) => {
      if (isCleanedUp) return;
      e?.stopPropagation?.();
      setSelectedRegion(region.id);
    });

    const handleClick = () => {
      if (isCleanedUp) return;
      setSelectedRegion(null);
    };

    const containerElement = waveformRef.current;
    containerElement.addEventListener("click", handleClick);

    // Load the audio file
    console.log("Loading audio blob...");
    wavesurfer.loadBlob(audioFile).catch((error) => {
      if (isCleanedUp) return;
      console.error("Error loading audio blob:", error);
      setIsLoading(false);
      alert("Failed to load audio file. Please try again.");
    });

    return () => {
      console.log("Cleaning up WaveSurfer");
      isCleanedUp = true;
      containerElement?.removeEventListener("click", handleClick);
      wavesurfer.destroy();
    };
  }, [audioFile, onAudioBufferReady, containerReady]);

  useEffect(() => {
    if (wavesurferRef.current && zoom) {
      wavesurferRef.current.zoom(zoom);
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
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 10));
  };

  const handleAddRegion = () => {
    if (!regionsPluginRef.current || !wavesurferRef.current) return;

    const duration = wavesurferRef.current.getDuration();
    const currentTime = wavesurferRef.current.getCurrentTime();
    const start = Math.min(currentTime, duration - 2);
    const end = Math.min(start + 2, duration);

    regionsPluginRef.current.addRegion({
      start,
      end,
      color: generateRandomColor(),
      drag: true,
      resize: true,
    });
  };

  const handleDeleteRegion = () => {
    if (!selectedRegion || !regionsPluginRef.current) return;

    const region = regionsPluginRef.current
      .getRegions()
      .find((r) => r.id === selectedRegion);
    if (region) {
      region.remove();
      setRegions((prev) => {
        const newRegions = prev.filter((r) => r.id !== selectedRegion);
        saveToHistory(newRegions);
        return newRegions;
      });
      setSelectedRegion(null);
    }
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
    if (!regionsPluginRef.current) return;

    regionsPluginRef.current.clearRegions();

    state.regions.forEach((region) => {
      regionsPluginRef.current!.addRegion({
        id: region.id,
        start: region.start,
        end: region.end,
        color: region.color || generateRandomColor(),
        drag: true,
        resize: true,
      });
    });

    setRegions(state.regions);
  };

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
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
            Zoom: {zoom}x | Regions: {regions.length}
          </div>
        </div>

        {isLoading && (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-600">Loading audio file...</p>
            </div>
          </div>
        )}

        {/* {!isLoading && (
          <div
            ref={waveformRef}
            className="w-full overflow-x-auto overflow-y-hidden touch-pan-x rounded-lg bg-gray-50 mb-4"
            style={{ cursor: "pointer" }}
          />
        )} */}
        <div
          ref={waveformRef}
          className="w-full h-48 overflow-x-auto rounded-lg bg-gray-50 mb-4"
        />
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
