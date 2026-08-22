import { CourseLab, CourseTrack, UserState } from '../../types';

export interface InteractiveLabViewProps {
  userState: UserState;
  courses: CourseTrack[];
  onCompleteLab: (labId: string, score: number, code: string) => void;
  onOpenUpgradeModal: () => void;
  onOpenCertificateModal: (trackId?: string) => void;
  selectedTrackId: string;
  selectedLabId: string;
  onSelectTrackAndLab: (trackId: string, labId: string) => void;
}

export interface CommandItem {
  label: string;
  cmd: string;
  color: string;
}

export interface FormattedChatMessageProps {
  text: string;
  onRunTests?: () => void;
  onInjectCode?: (code: string) => void;
  onClearTerminal?: () => void;
  onOpenUpgrade?: () => void;
  labTitle?: string;
  labConcept?: string;
}

export interface LabTerminalState {
  logs: string[];
  input: string;
}

export interface LabAIState {
  chat: { sender: 'user' | 'ai'; text: string }[];
  isReplying: boolean;
  query: string;
  isFullscreen: boolean;
}

export type MobilePane = 'instructions' | 'editor' | 'ai';
