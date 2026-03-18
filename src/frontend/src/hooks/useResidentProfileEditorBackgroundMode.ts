import { BackgroundMode } from "../backend";
import { useGetAppSettings } from "./useQueries";

export function useResidentProfileEditorBackgroundMode() {
  const { data: appSettings, isLoading } = useGetAppSettings();

  const mode: BackgroundMode =
    appSettings?.displayPreferences.residentProfileEditorBackgroundMode ||
    BackgroundMode.solidWhite;

  const className =
    mode === BackgroundMode.solidBlack
      ? "resident-profile-editor-black"
      : "resident-profile-editor-white";

  return {
    mode,
    className,
    isLoading,
  };
}
