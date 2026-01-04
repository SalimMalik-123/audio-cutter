import { useState } from "react";
import { ExportOptions } from "../types";
import { X } from "lucide-react";

interface ExportOptionsModalProps {
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  title: string;
}

export const ExportOptionsModal = ({
  onClose,
  onExport,
  title,
}: ExportOptionsModalProps) => {
  const [prefix, setPrefix] = useState("");
  const [startSequence, setStartSequence] = useState(1);
  const [fileType, setFileType] = useState<ExportOptions["fileType"]>(".wav");
  const [filename, setFilename] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport({ prefix, startSequence, fileType, filename });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="filename"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              File Name
            </label>
            <input
              type="text"
              id="filename"
              required
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="file name"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="prefix"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prefix (Optional)
            </label>
            <input
              type="text"
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. Clip, Intro, Music"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sequence"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Sequence
              </label>
              <input
                type="number"
                id="sequence"
                min="1"
                value={startSequence}
                onChange={(e) =>
                  setStartSequence(parseInt(e.target.value) || 1)
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                File Type
              </label>
              <select
                id="type"
                value={fileType}
                onChange={(e) =>
                  setFileType(e.target.value as ExportOptions["fileType"])
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value=".wav">.wav</option>
                <option value=".mp3">.mp3</option>
                {/* <option value=".mp4">.mp4</option>
                <option value=".m4a">.m4a</option> */}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
            >
              Export
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
