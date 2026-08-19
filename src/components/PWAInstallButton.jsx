import { usePWAInstall } from '../hooks/usePWAInstall';
import { MdDownload } from 'react-icons/md';

export default function PWAInstallButton() {
  const { showInstallButton, handleInstallClick } = usePWAInstall();

  if (!showInstallButton) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200"
      title="Install app"
      aria-label="Install app"
    >
      <MdDownload size={20} />
      <span className="hidden sm:inline">Install</span>
    </button>
  );
}
