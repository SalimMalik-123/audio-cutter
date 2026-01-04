import { useState, useEffect, useRef } from "react";
import { FileUpload } from "./components/FileUpload";
import { WaveformEditor } from "./components/WaveformEditor";
import {
  exportRegion,
  exportAllRegions,
  downloadBlob,
} from "./utils/audioProcessor";
import { RotateCcw } from "lucide-react";
import { AudioRegion, ExportOptions } from "./types";
import { ExportOptionsModal } from "./components/ExportOptionsModal";

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [regions, setRegions] = useState<AudioRegion[]>([]);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const regionsRef = useRef<AudioRegion[]>([]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<"single" | "all">("single");
  const [pendingRegionId, setPendingRegionId] = useState<string | null>(null);

  useEffect(() => {
    audioBufferRef.current = audioBuffer;
  }, [audioBuffer]);

  useEffect(() => {
    regionsRef.current = regions;
  }, [regions]);

  useEffect(() => {
    const handleExportRegion = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setPendingRegionId(customEvent.detail);
      setExportType("single");
      setShowExportModal(true);
    };

    const handleExportAll = () => {
      setExportType("all");
      setShowExportModal(true);
    };

    window.addEventListener("export-region", handleExportRegion);
    window.addEventListener("export-all-regions", handleExportAll);

    return () => {
      window.removeEventListener("export-region", handleExportRegion);
      window.removeEventListener("export-all-regions", handleExportAll);
    };
  }, [audioFile]);

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
    setAudioBuffer(null);
  };

  const handleAudioBufferReady = (buffer: AudioBuffer) => {
    setAudioBuffer(buffer);
  };

  const handleReset = () => {
    setAudioFile(null);
    setAudioBuffer(null);
  };

  const handlePerformExport = async (options: ExportOptions) => {
    debugger;
    setShowExportModal(false);
    if (!audioBufferRef.current || !audioFile) return;

    try {
      if (exportType === "single" && pendingRegionId) {
        const targetRegion = regionsRef.current.find(
          (r) => r.id === pendingRegionId
        );
        if (targetRegion) {
          const { blob, fileName } = await exportRegion(
            audioBufferRef.current,
            targetRegion,
            options
          );
          downloadBlob(blob, fileName);
        }
      } else if (exportType === "all") {
        const blob = await exportAllRegions(
          audioBufferRef.current,
          regionsRef.current,
          options
        );
        downloadBlob(blob, `${options.filename}.zip`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export audio. Please try again.");
    }
  };

  if (!audioFile) {
    return <FileUpload onFileSelect={handleFileSelect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audio Cutter</h1>
            <p className="text-sm text-gray-600 mt-1">{audioFile.name}</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors touch-manipulation"
          >
            <RotateCcw size={20} />
            New File
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <WaveformEditor
          audioFile={audioFile}
          onAudioBufferReady={handleAudioBufferReady}
          onRegionsChange={setRegions}
        />
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            100% client-side processing • Your audio never leaves your device
          </p>
        </div>
      </footer>

      {showExportModal && (
        <ExportOptionsModal
          title={
            exportType === "single" ? "Export Selected" : "Export All (ZIP)"
          }
          onClose={() => setShowExportModal(false)}
          onExport={handlePerformExport}
        />
      )}
    </div>
  );
}

export default App;
