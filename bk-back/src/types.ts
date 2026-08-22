export type UserTier = 'free' | 'pro' | 'enterprise';

export interface UserState {
  tier: UserTier;
  completedLabs: string[];
  inProgressCourseId: string;
  activeLabId: string;
  xpPoints: number;
  unlockedCertificates: string[];
  coachingCallsRemaining: number;
  savedStarterKits: string[];
}

export interface CourseLab {
  id: string;
  title: string;
  durationMinutes: number;
  difficulty: 'Intermediate' | 'Advanced' | 'Senior' | 'Staff' | 'Principal';
  isPro: boolean;
  conceptSummary: string;
  architectureDiagramUrl?: string;
  initialFiles: {
    filename: string;
    language: string;
    code: string;
  }[];
  instructions: string[];
  testCases: {
    id: string;
    name: string;
    expectedOutcome: string;
  }[];
}

export interface CourseTrack {
  id: string;
  trackNumber: number;
  title: string;
  tagline: string;
  paradigm: string;
  badgeColor: string;
  iconName: string;
  description: string;
  learningGoals: string[];
  deliverableProject: {
    title: string;
    description: string;
    techStack: string[];
  };
  labs: CourseLab[];
}

export interface SystemNode {
  id: string;
  label: string;
  type: 'gateway' | 'rate_limiter' | 'queue' | 'cache' | 'primary_db' | 'replica_db' | 'worker' | 'vector_db' | 'ai_agent' | 'external_api';
  x: number;
  y: number;
  status: 'healthy' | 'degraded' | 'bottleneck' | 'failed';
  rps: number;
  latencyMs: number;
  config: Record<string, string | number>;
}

export interface SystemConnection {
  id: string;
  fromId: string;
  toId: string;
  protocol: 'gRPC' | 'HTTP/REST' | 'WebSocket' | 'AMQP' | 'TCP/Pool';
  label?: string;
  active: boolean;
}

export interface TeardownArticle {
  id: string;
  company: string;
  logoColor: string;
  title: string;
  readTime: string;
  summary: string;
  keyInsights: string[];
  architectureOverview: string;
  rfcCodeSnippet: string;
  tags: string[];
}

export interface StarterKitOption {
  id: string;
  name: string;
  paradigm: 'Node & TypeScript' | 'Ruby on Rails 7+' | 'Rust & Go' | 'AI-Native Agentic Backend';
  db: 'PostgreSQL + Drizzle' | 'PostgreSQL + pgvector' | 'PostgreSQL + ActiveRecord' | 'CockroachDB';
  queue: 'Redis / BullMQ' | 'Sidekiq' | 'RabbitMQ' | 'Temporal';
  auth: 'Clerk' | 'Auth0' | 'Custom JWT / Devise' | 'OAuth2 Server';
  description: string;
  stars: number;
  downloadCount: string;
  githubRepoUrl: string;
}

export interface WorkshopEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  speaker: string;
  speakerRole: string;
  topic: string;
  attendeesCount: number;
  isLive: boolean;
}
