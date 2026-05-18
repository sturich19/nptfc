export type TrackerPhase = 'setup' | 'tracking' | 'saving' | 'done';

export type EventType =
  | 'GOAL_LEFT'
  | 'GOAL_RIGHT'
  | 'GOAL_OTHER'
  | 'SHOT_ON'
  | 'SHOT_OFF'
  | 'SHOT_LEFT'
  | 'SHOT_RIGHT'
  | 'ASSIST'
  | 'SAVE'
  | 'PEN_SAVE';

export interface LiveEvent {
  id: string;
  playerId: number;
  playerName: string;
  eventType: EventType;
  timestamp: number;
}

export interface PlayerLiveStats {
  playerId: number;
  goals: number;
  goalsLeft: number;
  goalsRight: number;
  goalsOther: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  shotsLeft: number;
  shotsRight: number;
  saves: number;
  penSaves: number;
  played: boolean;
}

export const EVENT_FIELD_MAP: Record<EventType, Partial<PlayerLiveStats>> = {
  GOAL_LEFT:  { goals: 1, goalsLeft: 1, shots: 1, shotsOnTarget: 1, shotsLeft: 1 },
  GOAL_RIGHT: { goals: 1, goalsRight: 1, shots: 1, shotsOnTarget: 1, shotsRight: 1 },
  GOAL_OTHER: { goals: 1, goalsOther: 1, shots: 1, shotsOnTarget: 1 },
  SHOT_ON:    { shots: 1, shotsOnTarget: 1 },
  SHOT_OFF:   { shots: 1, shotsOffTarget: 1 },
  SHOT_LEFT:  { shots: 1, shotsLeft: 1 },
  SHOT_RIGHT: { shots: 1, shotsRight: 1 },
  ASSIST:     { assists: 1 },
  SAVE:       { saves: 1 },
  PEN_SAVE:   { penSaves: 1 },
};

export const EVENT_LABELS: Record<EventType, string> = {
  GOAL_LEFT:  'Goal - Left Foot',
  GOAL_RIGHT: 'Goal - Right Foot',
  GOAL_OTHER: 'Goal - Header/Other',
  SHOT_ON:    'Shot on Target',
  SHOT_OFF:   'Shot off Target',
  SHOT_LEFT:  'Shot - Left Foot',
  SHOT_RIGHT: 'Shot - Right Foot',
  ASSIST:     'Assist',
  SAVE:       'Save',
  PEN_SAVE:   'Penalty Save',
};

export const GK_ONLY_EVENTS: EventType[] = ['SAVE', 'PEN_SAVE'];
