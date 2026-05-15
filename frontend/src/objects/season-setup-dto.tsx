export interface SeasonSetupDTO {
    startYear: number;
    endYear: number;
    ageGroup: number;
    monthStart: string;
    monthEnd: string;
    ageGroupId: number;
    division: number;
    active: boolean;
    teamIds: number[];
}